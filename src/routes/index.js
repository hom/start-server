const router = require('express').Router();
const Parse = require('../Parse');

router.get('/api/cards', async (req, res, next) => {
  const headers = { ...req.headers };
  
  let results;
  try {
    results = await (new Parse.Query('Card')).find();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: '服务器出错啦',
    });
  }

  res.status(200).json({
    data: results.map((item) => item.toJSON()),
  });
})

module.exports = router;