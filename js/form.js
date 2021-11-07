import {isEscapeKey} from './utils.js';
import {sendData} from './fetch.js';

// Записываем элементы формы в переменные
const documentBody = document.querySelector('body');
const uploadForm = document.querySelector('.img-upload__form');
const uploadButton = uploadForm.querySelector('.img-upload__input');
const editingImageForm = uploadForm.querySelector('.img-upload__overlay');

// Создаем функцию, открывающую окно редактирования фото

const openImageModal = () => {
  const reduceScaleControl = uploadForm.querySelector('.scale__control--smaller');
  const increaseScaleControl = uploadForm.querySelector('.scale__control--bigger');
  const imageScaleValueField = uploadForm.querySelector('.scale__control--value');
  const image = uploadForm.querySelector('.img-upload__preview img');

  // Масштаб

  let scaleValue = 100;
  const changeImageScaleStyle = () => image.style.transform = `scale(${scaleValue / 100})`;

  const onReduceControlClick = () => {
    if (scaleValue > 25 && scaleValue <= 100) {
      scaleValue -= 25;
      imageScaleValueField.value = `${scaleValue}%`;
      changeImageScaleStyle();
    }
  };

  const onIncreaseControlClick = () => {
    if (scaleValue >= 25 && scaleValue <= 75) {
      scaleValue += 25;
      imageScaleValueField.value = `${scaleValue}%`;
      changeImageScaleStyle();
    }
  };

  reduceScaleControl.addEventListener('click', onReduceControlClick);
  increaseScaleControl.addEventListener('click', onIncreaseControlClick);

  // Слайдер

  const slider = document.querySelector('.effect-level__slider');

  noUiSlider.create(slider, {
    start: [1],
    step: 0.1,
    range: {
      'min': [0],
      'max': [1],
    },
  });

  // Эффекты

  const effectsList = uploadForm.querySelector('.effects__list');
  const effectRadioInputNone = uploadForm.querySelector('#effect-none');
  const effectLevelValueInput = uploadForm.querySelector('.effect-level__value');
  const sliderContainer = uploadForm.querySelector('.img-upload__effect-level');

  sliderContainer.style.display = 'none';
  effectRadioInputNone.checked = true;

  const onEffectChange = (evt) => {
    if (evt.target.matches('input[type="radio"]')) {
      image.className = '';
      image.classList.add(`effects__preview--${evt.target.value}`);
      sliderContainer.style.display = '';
      effectLevelValueInput.value = '';

      let effectName;
      let unitMeasure;

      if (image.classList.contains('effects__preview--none')) {
        image.style.filter = '';
        sliderContainer.style.display = 'none';
        effectLevelValueInput.value = '';
      }

      if (image.classList.contains('effects__preview--chrome')) {
        effectName = 'grayscale';
        effectLevelValueInput.value = 1;

        slider.noUiSlider.updateOptions({
          start: [effectLevelValueInput.value],
          step: 0.1,
          range: {
            'min': [0],
            'max': [1],
          },
        });

        unitMeasure = '';
        image.style.filter = `${effectName}(${effectLevelValueInput.value})`;
      }

      if (image.classList.contains('effects__preview--sepia')) {
        effectName = 'sepia';
        effectLevelValueInput.value = 1;

        slider.noUiSlider.updateOptions({
          start: [effectLevelValueInput.value],
          step: 0.1,
          range: {
            'min': [0],
            'max': [1],
          },
        });

        unitMeasure = '';
        image.style.filter = `${effectName}(${effectLevelValueInput.value})`;
      }

      if (image.classList.contains('effects__preview--marvin')) {
        effectName = 'invert';
        effectLevelValueInput.value = 100;

        slider.noUiSlider.updateOptions({
          start: [effectLevelValueInput.value],
          step: 1,
          range: {
            'min': [0],
            'max': [100],
          },
        });

        unitMeasure = '%';
        image.style.filter = `${effectName}(${effectLevelValueInput.value}${unitMeasure})`;
      }

      if (image.classList.contains('effects__preview--phobos')) {
        effectName = 'blur';
        effectLevelValueInput.value = 3;

        slider.noUiSlider.updateOptions({
          start: [effectLevelValueInput.value],
          step: 0.1,
          range: {
            'min': [0],
            'max': [3],
          },
        });

        unitMeasure = 'px';
        image.style.filter = `${effectName}(${effectLevelValueInput.value}${unitMeasure})`;
      }

      if (image.classList.contains('effects__preview--heat')) {
        effectName = 'brightness';
        effectLevelValueInput.value = 3;

        slider.noUiSlider.updateOptions({
          start: [effectLevelValueInput.value],
          step: 0.1,
          range: {
            'min': [1],
            'max': [3],
          },
        });

        unitMeasure = '';
        image.style.filter = `${effectName}(${effectLevelValueInput.value}${unitMeasure})`;
      }

      slider.noUiSlider.on('slide', () => {
        effectLevelValueInput.value = slider.noUiSlider.get();
        image.style.filter = `${effectName}(${effectLevelValueInput.value}${unitMeasure})`;
      });
    }
  };

  effectsList.addEventListener('change', onEffectChange);

  // Хэштеги

  const hashtagInput = uploadForm.querySelector('.text__hashtags');

  // Создаем функцию, проверяющую хештеги на валидность

  const isHashtagsValid = (hashs) => {

    const isHashtagStartsWithHash = (hash) => hash.substring(0,1) === '#';

    const isHashtagHasCorrectSymbols = (hash) => {
      const regExpCorrectSymbols = /[A-Za-zА-Яа-яЁё0-9]/;

      let result;

      for (let i = 1; i < hash.length; i++) {
        result = regExpCorrectSymbols.test(hash[i]);
        if (!result) {
          return false;
        }
      }
      return true;
    };

    const isHashtagHasCorrectLength = (hash) => hash.length <= 20;

    const isHashtagAmountCorrect = () => hashs.length <= 5;

    const isHashtagNoRepeat = () => {
      for (let i = 0; i < hashs.length; i++) {
        for (let j = 0; j < hashs.length; j++) {
          if (i === j) {
            continue;
          }

          if (hashs[i].toLowerCase() === hashs[j].toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    };

    if (hashtagInput.value.length === 0) {
      return true;
    }

    const validateHash = (hash) => {
      if (!isHashtagStartsWithHash(hash)) {
        hashtagInput.setCustomValidity('Хештег должен начинаться с #');
        hashtagInput.reportValidity();
        return false;
      } else if (!isHashtagHasCorrectSymbols(hash)) {
        hashtagInput.setCustomValidity('Хештег не может содержать пробелы, спецсимволы, символы пунктуации, эмодзи и т. д.');
        hashtagInput.reportValidity();
        return false;
      } else if (!isHashtagHasCorrectLength(hash)) {
        hashtagInput.setCustomValidity('Максимальная длина одного хэш-тега 20 символов');
        hashtagInput.reportValidity();
        return false;
      } else {
        return true;
      }
    };

    for (let i = 0; i < hashs.length; i++) {
      if (!validateHash(hashs[i])) {
        return false;
      }
    }

    if (!isHashtagAmountCorrect()) {
      hashtagInput.setCustomValidity('Можно указать не более 5 хештегов');
      hashtagInput.reportValidity();
      return false;
    }

    if (!isHashtagNoRepeat()) {
      hashtagInput.setCustomValidity('Хештеги не должны повторяться');
      hashtagInput.reportValidity();
      return false;
    }

    return true;
  };

  // Комментарии

  const commentInput = uploadForm.querySelector('.text__description');

  // Создаем функцию, проверяющую комментарий на валидность

  const isCommentValid = () => {

    if (commentInput.value.length > 140) {
      commentInput.setCustomValidity('Длина комментария не может составлять больше 140 символов');
      commentInput.reportValidity();
      return false;
    }

    return true;
  };

  // Создаем функции, которые рисуют и закрывают попап об успешной отправке формы

  const showSuccesPopup = () => {

    // Закрываем модальное окно

    closeImageModalOnClick();

    // Клонируем шаблон и помещаем в body

    const succesTemplate = document.querySelector('#success').content;
    const template = succesTemplate.querySelector('.success');

    const fragment = document.createDocumentFragment();

    const element = template.cloneNode(true);

    fragment.appendChild(element);

    documentBody.appendChild(fragment);

    // Ищем кнопку закрытия в модалке

    const succesPopupCloseButton = document.querySelector('.success__button');

    // Сначала объявим функцию закрытия по Esc

    const closeSuccesPopupOnEsc = (evt) => {
      if (isEscapeKey(evt)) {
        closeSuccesPopupOnClick();
      }
    };

    // Далее объявим функцию закрытия по клику за пределами попапа

    const closeSuccesPopupOnClickOutside = (evt) => {
      if (evt.target.matches('.success')) {
        closeSuccesPopupOnClick();
      }
    };

    // И саму функцию, которая закрывает окно

    function closeSuccesPopupOnClick () {
      const succesPopup = document.querySelector('.success');
      documentBody.removeChild(succesPopup);
      document.removeEventListener('click', closeSuccesPopupOnClickOutside);
      succesPopupCloseButton.removeEventListener('click', closeSuccesPopupOnClick);
      document.removeEventListener('keydown', closeSuccesPopupOnEsc);
    }

    // Вешаем обработчики на кнопку закрытия, ESC и область за пределаеми попапа

    document.addEventListener('click', closeSuccesPopupOnClickOutside);
    succesPopupCloseButton.addEventListener('click', closeSuccesPopupOnClick);
    document.addEventListener('keydown', closeSuccesPopupOnEsc);
  };

  // Создаем функцию, которая показывает окно с ошибкой отправки формы

  const showErrorPopup = () => {

    // Закрываем модальное окно

    closeImageModalOnClick();

    // Клонируем шаблон и помещаем в body

    const errorTemplate = document.querySelector('#error').content;
    const template = errorTemplate.querySelector('.error');

    const fragment = document.createDocumentFragment();

    const element = template.cloneNode(true);

    fragment.appendChild(element);

    documentBody.appendChild(fragment);

    // Ищем кнопку закрытия в модалке

    const errorPopupCloseButton = document.querySelector('.error__button');

    // Сначала объявим функцию закрытия по Esc

    const closeErrorPopupOnEsc = (evt) => {
      if (isEscapeKey(evt)) {
        closeErrorPopupOnClick();
      }
    };

    // Далее объявим функцию закрытия по клику за пределами попапа

    const closeErrorPopupOnClickOutside = (evt) => {
      if (evt.target.matches('.error')) {
        closeErrorPopupOnClick();
      }
    };

    // И саму функцию, которая закрывает окно

    function closeErrorPopupOnClick () {
      const errorPopup = document.querySelector('.error');
      documentBody.removeChild(errorPopup);
      document.removeEventListener('click', closeErrorPopupOnClickOutside);
      errorPopupCloseButton.removeEventListener('click', closeErrorPopupOnClick);
      document.removeEventListener('keydown', closeErrorPopupOnEsc);
    }

    // Вешаем обработчики на кнопку закрытия, ESC и область за пределаеми попапа

    document.addEventListener('click', closeErrorPopupOnClickOutside);
    errorPopupCloseButton.addEventListener('click', closeErrorPopupOnClick);
    document.addEventListener('keydown', closeErrorPopupOnEsc);
  };

  // Создаем функции-обработчики для полей формы

  const onFormSubmit = (evt) => {
    evt.preventDefault();
    const hashs = hashtagInput.value.split(' ');

    if (!isHashtagsValid(hashs)) {
      hashtagInput.style.outline = '1px solid red';
    } else {
      hashtagInput.style.outline = '1px inset blue';
    }

    if (!isCommentValid()) {
      commentInput.style.outline = '1px solid red';
    } else {
      commentInput.style.outline = '1px inset blue';
    }

    const formData = new FormData(evt.target);

    sendData(showSuccesPopup, showErrorPopup, formData);

  };

  const onHashtagInput = () => {
    hashtagInput.setCustomValidity('');
  };

  const onCommentInput = () => {
    commentInput.setCustomValidity('');
  };

  const onFieldFocusKeydown = (evt) => {
    if (isEscapeKey(evt)) {
      evt.stopPropagation();
    }
  };

  const onFieldFocus = () => {
    hashtagInput.addEventListener('keydown', onFieldFocusKeydown);
    commentInput.addEventListener('keydown', onFieldFocusKeydown);

  };

  const onFieldBlur = () => {
    hashtagInput.removeEventListener('focus', onFieldFocus);
    commentInput.removeEventListener('focus', onFieldFocus);
    hashtagInput.removeEventListener('focus', onFieldFocusKeydown);
    commentInput.removeEventListener('focus', onFieldFocusKeydown);
  };

  // Вешаем слушатели событий на элементы формы

  uploadForm.addEventListener('submit', onFormSubmit);
  hashtagInput.addEventListener('input', onHashtagInput);
  commentInput.addEventListener('input', onCommentInput);

  hashtagInput.addEventListener('focus', onFieldFocus);
  commentInput.addEventListener('focus', onFieldFocus);

  hashtagInput.addEventListener('blur', onFieldBlur);
  commentInput.addEventListener('blur', onFieldBlur);

  // Закрытие окна

  const imageModalCloseButton = uploadForm.querySelector('.img-upload__cancel');

  const clearModalValues = () => {
    uploadButton.value = '';
    hashtagInput.value = '';
    commentInput.value = '';
    imageScaleValueField.value = '100%';
    image.style.filter = '';
    slider.noUiSlider.destroy();
    image.className = '';
    image.classList.add('effects__preview--none');
  };

  const closeImageModalOnEsc = (evt) => {
    if (isEscapeKey(evt)) {
      closeImageModalOnClick();
    }
  };

  const removeImageModalEventListeners = () => {
    imageModalCloseButton.removeEventListener('click', closeImageModalOnClick);
    document.removeEventListener('keydown', closeImageModalOnEsc);
    reduceScaleControl.removeEventListener('click', onReduceControlClick);
    increaseScaleControl.removeEventListener('click', onIncreaseControlClick);
    effectsList.removeEventListener('change', onEffectChange);
    uploadForm.removeEventListener('submit', onFormSubmit);
    hashtagInput.removeEventListener('input', onHashtagInput);
    commentInput.removeEventListener('input', onCommentInput);
    hashtagInput.removeEventListener('blur', onFieldBlur);
    commentInput.removeEventListener('blur', onFieldBlur);
  };

  function closeImageModalOnClick () {
    editingImageForm.classList.add('hidden');
    documentBody.classList.remove('modal--open');
    removeImageModalEventListeners();
    clearModalValues();
  }


  imageModalCloseButton.addEventListener('click', closeImageModalOnClick);
  document.addEventListener('keydown', closeImageModalOnEsc);
};

// Создаем функцию, которая вешает слушатель на кнопку загрузки фото и открывает модальное окно
// редактирования фотографии

const uploadImage = () => {
  uploadButton.addEventListener('change', () => {
    editingImageForm.classList.remove('hidden');
    documentBody.classList.add('modal--open');
    openImageModal();
  });
};

export {uploadImage, openImageModal};
