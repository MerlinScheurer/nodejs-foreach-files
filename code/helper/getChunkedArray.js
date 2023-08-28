const getChunkedArray = (array, chunkSize) => {
  if (chunkSize <= 0) {
    return [];
  }

  const chunkedArray = [];

  const length = array.length;

  for (let i = 0; i < length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }

  return chunkedArray;
};

export default getChunkedArray;
