/**
 * model user
 * @type model
 */
var $m = require('pandorajs').core.loadDbModel();
var $s = {
	id: Number,
	username: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		index: true
	},
	userpwd: String,
	usersex: {
		type: Number,
		min: 1,
		max: 1
	},
	useremail: {
		type: String
	},
	userphone: {
		type: String
	},
	canopen: {
		type: Number,
		min: 1,
		max: 1,
		default: 1
	},
	islock: {
		type: Number,
		min: 1,
		max: 1,
		default: 1
	},
	createtime: {
		type: Date,
		default: Date.now
	}
};
var mm = new $m({
	tablename: "user",
	schema: $s
});
mm.plugin("autoIncrement", {
			field: 'id',
			startAt: 1
});
mm.path('username').validate(function(value) {
			return !/admin/i.test(value);
		}, '用户名中不应该包含admin字符');
module.exports = mm;