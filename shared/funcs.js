function strRepeat(string, num){
    return new Array( num + 1 ).join( string );
}

function indexOfgenericId(array, id, pos) {
    for (var i = 0; i < array.length; i++)
        if (array[i].genericId === id){
            return array[i]._id; i = 0; break;}
    return (array[pos] || '' && pos == -1)? array[pos]._id : null;      
}

// polje, reverse!, (parseInt, parseFloat)
function sortBy(field, reverse, primer){

   var key = function (x) {return primer ? primer(x[field]) : x[field]};

   return function (a,b) {
       var A = key(a), B = key(b);

       return ((A < B) ? -1 : (A > B) ? + 1 : 0) * [-1,1][+!!reverse];                  
   }
}

// Poredi dva array-a na osnovu jedne osobine
function compareArrays(a, b, prop){
    if(a[0].hasOwnProperty(prop) === b[0].hasOwnProperty(prop)) return true;
}

exports.sortBy = sortBy;
exports.compareArrays = compareArrays;
exports.strRepeat = strRepeat;
exports.indexOfgenericId = indexOfgenericId;
