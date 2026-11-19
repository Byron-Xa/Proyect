// todo el texto en mayuscula
export function toUpperCase(text){
    if (!text) return '';
    return text.toUpperCase();
}

export function toUpperNoSpaces(text){
    if (!text) return '';
    return text.toUpperCase().replace(/\s/g, '');
}
// primera letra en mayuscula
export function toCapitalize(text){
    if (!text) return '';
    return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}