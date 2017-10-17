/**
 * Created by zhaolongwei on 17/5/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let should = chai.should();
let login = require('./login');
let loginSuccess = login.loginSuccess;


chai.use(chaiHttp);

login.loginTest();

//需要登录
loginSuccess(({userInfo, token, loginParams, baseUrl}) => {
  let request = null;
  beforeEach(() => {
    request = chai.request(baseUrl);
  });

  describe('用户列表', ()=> {
    describe('get /user/list', ()=> {
      it('should get a list', (done) => {
        let ajax = request.get('/user/list')
        .set('x-auth-token', token)
        .query({
          keyword: 'admin',
          size: 10,
          page: 1
        })
        .end((err, resp) => {
          resp.should.have.status(200);
          let body = resp.body;
          body.should.have.property('datas');

          let datas = body.datas;
          datas.should.be.a('object');
          datas.should.have.property('pageList');
          datas.pageList.should.be.a('array');

          //console.log(ajax.qs)
          //console.log(ajax)
          //console.log(ajax.qs.size)
          // console.log(resp.status)
          // let body = resp.body;

          // body.should.have.property('data');
          // let data = body.data;
          // data.should.equal(true);

          done();
        });

      });
    });
  });
});

