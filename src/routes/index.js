const got = require('got');
const router = require('express').Router();
const Parse = require('../Parse');
const upyun = require('../Upyun');
const fs = require('fs');

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


router.post('/api/card', async (req, res, next) => {
  let body = { ...req.body };

  let result;
  try {
    result = await (new Parse.Object('Card')).save(body);
  } catch (error) {
    return res.status(500).json({
      error: '保存Card出错啦',
    });
  }

  return res.status(200).json({
    data: result.toJSON(),
  });
});

router.post('/api/mark', async (req, res, next) => {
  const { url, title, name, target, card } = { ...req.body };

  let filePath = process.env.UPYUN_DIRECTORY_NAME + name;
  if (url) {
    let date = new Date().toGMTString();
    let sign = upyun.sign('PUT', '/'+ process.env.UPYUN_BUCKET_NAME + filePath, date);
    let upyunURL = process.env.UPYUN_SERVER_URL + '/'+ process.env.UPYUN_BUCKET_NAME + filePath;
    try {
      let promise = new Promise((resolve, reject) => {
        got.stream(url, {
          headers: {
            'Content-Type': 'image/png'
          }
        })
        .on('error', (error) => {
          console.error(error);
          reject(error);
        })
        .pipe(got.stream.put(upyunURL, {
          headers: {
            Authorization: sign,
            Date: date,
            'Content-Type': 'image/png',
          },
          stream: true,
        }).on('response', (response) => {
          resolve(response);
        }).on('error', (error) => {
          console.error(error);
          reject(error);
        }))
      })
      await promise;
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: '上传图片失败',
      });
    }
  }

  let mark = {
    title,
    target,
    card,
    favicon: process.env.CDN_URL + filePath,
  }

  let result;
  try {
    result = await (new Parse.Object('Mark')).save(mark);
  } catch (error) {
    return res.status(500).json({
      error: '保存Mark出错啦',
    });
  }

  return res.status(200).json({
    data: result.toJSON(),
  });
})

module.exports = router;