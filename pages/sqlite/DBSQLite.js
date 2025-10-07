
import {
    enablePromise,
    openDatabase,
} from "react-native-sqlite-storage"

// Enable promise for SQLite
enablePromise(true)

export const connectToDatabase = async () => {
    return openDatabase(
        { name: "yourProjectName.db", location: "default" },
        () => { },
        (error) => {
            console.error(error)
            throw Error("Could not connect to database")
        }
    )
}

// Open a database

// function myCustomFunction(arg1, arg2) {
//     // Perform some computation
//     return arg1 + arg2;
// // }
// const db = SQLite.openDatabase({ name: 'test.db', location: 'default' });

// Define your custom function


export const setItemDBSQL = async (key, value, tableName) => {
    // console.log(key, value, tableName)
    // if (key == "ActivityList") {
    //     SelectData();
    // }
    await connectToDatabase();
    // db.transaction((tx) => {
    //     tx.executeSql('SELECT myCustomFunction(?, ?) as result', [5, 10], (tx, results) => {
    //         const { rows } = results;
    //         if (rows.length > 0) {
    //             console.log('Result:', rows.item(0).result);
    //         } else {
    //             console.log('No result found.');
    //         }
    //     });
    // });
};

export const getItemDBSQL = async (key, value, tableName) => {
    if (key == "ActivityList") {

    }
};

// const SelectData = () => {
//     db.transaction(tx => {
//         tx.executeSql('SELECT * FROM test', [], (tx, results) => {
//             console.log("aaa")
//         });
//     })
// }