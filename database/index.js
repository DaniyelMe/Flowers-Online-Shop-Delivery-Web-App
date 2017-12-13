const tables = {
	users: require('./users'),
	branches: require('./branches'),
	flowers: require('./flowers')
};

// Database API class.
// the class is static, it should not be instantiated.
class Database {
	static get(table, column, value) {
		if(Object.keys(tables).indexOf(table) === -1) throw Error(`Table name ${table} ins not valid!`);

		return tables[table].filter( row => row[column] == value );
	}

	static getOne(table, column, value) {
		return tables[table].find( row => row[column] == value );
	}

	static getOneIndex(table, column, value) {
		return tables[table].findIndex( row => row[column] == value );
	}

	static getAll(table) {
		return tables[table];
	}

	static update(table, column, value, payload) {
		let index = this.getOneIndex(table, column, value);
		let newObject = Object.assign(tables[table][index], payload);

		tables[table][index] = newObject;
	}

	static remove(table, column, value) {
		// Find the index of the requested item.
		let index = this.getOneIndex(table, column, value);

		// Remove it.
		tables[table].splice(index, 1);
	}
}

module.exports = Database;
