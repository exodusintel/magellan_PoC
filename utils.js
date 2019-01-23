function dbSuccess(tx, rs) {
/*
    for(let i=0; i< rs.rows.length; i++){
        var row = rs.rows[i];
        for(var j=0; j<row.AAA.length; j++){
            console.log(row.AAA[j].charCodeAt(0).toString(16));
        }
        console.log(row.AAA);
        console.log(row.BBB);
    }
*/

/*
    if(rs.rows.length != 0){
        console.log(rs.rows.item(0));
        //console.log(typeof rs.rows.item(0).AAA);
    }
    console.log("success");
    console.log(arguments);
*/
}

function dbErr() {
    console.log("err");
    console.log(arguments);

}

function runAll(statements, success) {
    db.transaction((tx) => {
        //console.log("alive");
        for(var i=0; i<statements.length; i++){
            //console.log("queueing " + statement);
            tx.executeSql(statements[i], [], dbSuccess, dbErr);
            statements[i] = null;
        }
        //console.log("queued");

    }, dbErr, success);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;

}

String.prototype.hexEncode = function(){
    var arr1 = [];
    for (var n = 0, l = this.length; n < l; n ++)
    {
        var hex = Number(this.charCodeAt(n)).toString(16);
        if(hex.length != 2){
            hex = "0" + hex;

        }
        arr1.push(hex);

    }
    return arr1.join('');

}

String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

function num_to_hex_string(num, length){
    let hex_string = '';
    while(num != 0){
        let byte = (num & 0xFF).toString(16);
        if(byte.length != 2){
            byte = '0' + byte;
        }
        hex_string += byte;
        num = Math.floor(num / 0x100);

    }
    if(hex_string.length != length){
        hex_string += "0".repeat(length - hex_string.length);
    }
    return hex_string;
}

function num_to_hex_bytes(num, length){
    let hex_string = '';
    while(num != 0){
        let byte = String.fromCharCode(num & 0xFF);
        hex_string += byte;
        num = Math.floor(num / 0x100);
    }
    if(hex_string.length != length){
        hex_string += String.fromCharCode(0).repeat(length - hex_string.length);
    }
    return hex_string;
}
