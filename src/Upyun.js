const crypto = require('crypto');

class Upyun {
  constructor(operator, password) {
    this.operator = operator;
    this.password = password;
  }

  sign(method, uri, date) {
    let signature = this.signature(method, uri, date);
    return `UPYUN ${this.operator}:${signature}`;
  }

  MD5(value) {
    return crypto.createHash('md5').update(value).digest('hex');
  }

  hmacsha1(secret, value) {
    return crypto.createHmac('sha1', secret)
      .update(value, 'utf-8')
      .digest()
      .toString('base64');
  }

  signature(method, uri, date) {
    let result = this.hmacsha1(this.password, `${method}&${uri}&${date}`);
    return result;
  }
}

module.exports = new Upyun(process.env.UPYUN_OPERATOR_NAME, process.env.UPYUN_OPERATOR_PASSWORD_MD5);