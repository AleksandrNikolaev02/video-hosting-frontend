const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const splitFile = (file: File) => {
  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < file.size) {
    const end = start + CHUNK_SIZE;
    chunks.push({
      blob: file.slice(start, end),
      index
    });

    start = end;
    index++;
  }

  return chunks;
};

export default splitFile;