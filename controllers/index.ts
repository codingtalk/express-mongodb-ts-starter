import express, { Router } from 'express';

const router: Router = express.Router();

router.post("/user/add", require("./user/index").add);
router.post("/user/login", require("./user/index").login);
router.post("/user/info", require("./user/index").info);

router.post("/file/add", require("./file/index").add);
router.post("/file/info", require("./file/index").info);
router.post("/file/update", require("./file/index").update);

router.post("/fileAccess/update", require("./file/access").update);

module.exports = router;
