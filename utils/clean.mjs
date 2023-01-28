import { deleteSync } from 'del'
const deletedFilePaths = deleteSync(['dist/*'])
console.log('Deleted files:\n', deletedFilePaths.join('\n '),'\n')
