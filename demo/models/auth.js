/**
 * model auth
 * @type model
 */
var pan = require('pandorjs'),
	$m = pan.core.loadDbModel();
var $s = {
	id: Number,
	userid: String,
	roleid: String,
	path: String
};
var mm = new $m({
	tablename: "auth",
	schema: $s
});
mm.plugin("autoIncrement", {
			field: 'id',
			startAt: 1
});
module.exports = mm;