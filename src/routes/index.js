const router = require('express').Router();
const Parse = require('../Parse');

async function findMark(card) {

}

router.get('/api/cards', async (req, res, next) => {
  const headers = { ...req.headers };
  
  let results = [];
  try {
    await (new Parse.Query('Card')).each(async (card) => {
      let marks;
      try {
        marks = await (new Parse.Query('Mark')).equalTo('card', card).find();
      } catch (error) {
        console.error(error);
        throw new Error('查询出错了');
      }

      let cardObject = { ...card.toJSON() };
      cardObject['marks'] = marks.map((item) => item.toJSON());
      return results.push(cardObject);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: '服务器出错啦',
    });
  }

  console.log(results);

  res.status(200).json({
    data: results,
  });
})

router.get('/api/card/:objectId', async (req, res, next) => {
  let where = { ...req.query };
  let objectId = req.params.objectId;

  let card;
  try {
    card = await (new Parse.Query('Card')).get(objectId);
  } catch (error) {
    return res.status(500).json({
      error: '查询Card出错啦',
    });
  }

  let marks;
  try {
    marks = await (new Parse.Query('Mark')).equalTo('card', card).find();
  } catch (error) {
    return res.status(500).json({
      error: '查询Mark出错啦',
    });
  }

  let cardObject = { ...card.toJSON() };
  cardObject['marks'] = marks.map((item) => item.toJSON());

  return res.status(200).json({
    data: cardObject,
  });
})

module.exports = router;