/**
 * Created by zhaolongwei on 17/6/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let async = require('async');
let expect = chai.expect;
let should = chai.should();

chai.use(chaiHttp);

module.exports = function({userInfo, token, loginParams, baseUrl}, exportCallback){
  let request = null;
  beforeEach(() => {
    request = chai.request('http://192.168.52.80:80/cloudrecord-web');
  });

  let auto1 = (callback) => {
    describe('日志查询——正常', ()=> {
      describe('POST /log/list', ()=> {
        let params = { page: 1, size: 10 }
        it('should searchSuccess', (done) => {
          let ajax = request.post('/log/list')
          .set('x-auth-token', token)
          .query(params)
          .send({})
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.should.have.property('page');
            datas.page.should.equal(params.page);
            datas.should.have.property('total');
            datas.should.have.property('pageList');

            callback();
            done();
          });
        });
      });
    });
  };

  let auto2 = (callback) => {
    describe('日志查询——正常-keyword', ()=> {
      let params = { page: 1, size: 10 }
      describe('POST /log/list', ()=> {
        it('should searchSuccess-pageList.length=0', (done) => {
          let ajax = request.post('/log/list')
          .set('x-auth-token', token)
          .query(params)
          .send({
            keyword: 'api-test' + Math.random()
          })
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.should.have.property('page');
            datas.page.should.equal(params.page);
            datas.should.have.property('total');
            datas.should.have.property('pageList');
            datas.pageList.length.should.equal(0);

            callback();
            done();
          });
        });
      });
    });
  };

  let auto3 = (callback) => {
    describe('日志查询——少参数page', ()=> {
      let params = {size: 10}
      describe('POST /log/list', ()=> {
        it('should searchError', (done) => {
          let ajax = request.post('/log/list')
          .set('x-auth-token', token)
          .query(params)
          .send({})
          .end((err, resp) => {
            console.log(resp.body)
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('9999');

            callback();
            done();
          });
        });
      });
    });
  };

  let auto = [auto1, auto2, auto3];
  async.auto(auto, (err, results) => {
    exportCallback(err, results);
  });
};