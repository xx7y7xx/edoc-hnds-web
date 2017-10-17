/**
 * Created by zhaolongwei on 17/5/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let should = chai.should();

let config = require('./config')

chai.use(chaiHttp);
function loginSuccess(...rest) {
  let baseUrl = config.testContextUrl;
  let callback, params = config.defaultLoginInfo;
  let isDefaultLogin = true;

  if(rest.length == 1){
    callback = rest[0];
  } else {
    isDefaultLogin =  false;
    callback = rest[1];
    params = rest[0];
  }

  let request = null;

  beforeEach(() => {
    request = chai.request(baseUrl);
  });
  describe('needLogin', ()=> {
    it('should loginSuccess', (done) => {
      let ajax = request.post('/login')
      .send(params)
      .end((err, resp) => {
        resp.should.have.status(200);
        resp.body.should.be.a('object');

        let body = resp.body;
        body.should.have.property('datas');
        body.should.have.property('code');

        let datas = body.datas;
        let code = body.code;
        if(isDefaultLogin){
          datas.should.have.property('corp');
          datas.should.have.property('user');
          code.should.equal('0000');
        }
        callback && callback({
          baseUrl,
          body,
          userInfo: datas,
          token: resp.header['x-auth-token'],
          loginParams: params,
        });

        done();
      });
    });
  });
}


function loginTest(){
  describe('登录接口——正常', ()=> {
    let params = config.defaultLoginInfo;
    let request = null;
    beforeEach(() => {
      request = chai.request('http://192.168.52.80:80/cloudrecord-web');
    });
    describe('POST /login', ()=> {
      it('should loginSuccess', (done) => {
        let ajax = request.post('/login')
        .send(params)
        .end((err, resp) => {
          resp.should.have.status(200);
          resp.body.should.be.a('object');

          let body = resp.body;
          body.should.have.property('datas');
          let datas = body.datas;
          datas.should.have.property('corp');
          datas.should.have.property('user');

          done();
        });
      });
    });
  });

  describe('登录接口——密码错误', ()=> {
    let params = { username: 'admin', password: 'testAdminTest'}
    let request = null;
    beforeEach(() => {
      request = chai.request('http://192.168.52.80:80/cloudrecord-web');
    });
    describe('POST /login', ()=> {
      it('should loginSuccess', (done) => {
        let ajax = request.post('/login')
        .send(params)
        .end((err, resp) => {
          console.log(resp.body)
          resp.should.have.status(200);
          resp.body.should.be.a('object');

          let body = resp.body;
          body.should.have.property('code');
          let code = body.code;
          code.should.be.a('string');
          code.should.equal('4002');

          body.should.have.property('msg');
          done();
        });
      });
    });
  });

  describe('登录接口——缺参username', ()=> {
    let params = {password: 'testAdminTest'}
    let request = null;
    beforeEach(() => {
      request = chai.request('http://192.168.52.80:80/cloudrecord-web');
    });
    describe('POST /login', ()=> {
      it('should loginSuccess', (done) => {
        let ajax = request.post('/login')
        .send(params)
        .end((err, resp) => {
          console.log(resp.body)
          resp.should.have.status(200);
          resp.body.should.be.a('object');

          let body = resp.body;
          body.should.have.property('code');
          let code = body.code;
          code.should.equal('8003');

          body.should.have.property('msg');
          done();
        });
      });
    });
  });

  describe('登录接口——缺参password', ()=> {
    let params = { username: 'admin'}
    let request = null;
    beforeEach(() => {
      request = chai.request('http://192.168.52.80:80/cloudrecord-web');
    });
    describe('POST /login', ()=> {
      it('should loginSuccess', (done) => {
        let ajax = request.post('/login')
        .send(params)
        .end((err, resp) => {
          console.log(resp.body)
          resp.should.have.status(200);
          resp.body.should.be.a('object');

          let body = resp.body;
          body.should.have.property('code');
          let code = body.code;
          code.should.equal('4001');

          body.should.have.property('msg');
          done();
        });
      });
    });
  });
}
exports.loginSuccess = loginSuccess;
exports.loginTest = loginTest;