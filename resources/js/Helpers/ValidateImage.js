export const returnFileSize = (number) => {
    //El tamaño del archivo en bytes.
    if (number < 1024) {
        return number + 'bytes';
    } else if (number >= 1024 && number < 1048576) {
        return (number / 1024).toFixed(1) + 'KB';
    } else if (number >= 1048576) {
        return (number / 1048576).toFixed(1) + 'MB';
    }
}

export const fileTypes = [
    "image/apng",
    "image/jpeg",
    "image/pjpeg",
    "image/png"
];

export const validFileType = (file) => {
    return fileTypes.includes(file.type);
}