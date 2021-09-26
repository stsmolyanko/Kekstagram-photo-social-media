// Функция, возвращающая случайное целое число из переданного диапазона включительно

function getRandomInt(min, max) {
  if (min < 0 || max < 0) {
    throw new Error('Значения диапазона чисел могут быть только положительными');
  }

  if (min > max) {
    const swap = min;
    min = max;
    max = swap;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

getRandomInt(0,10);


// Функция для проверки максимальной длины строки

function isStringFit(string, maxlength) {
  return +string.length <= maxlength;
}

isStringFit('Привет', 7);
