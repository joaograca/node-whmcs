const expect = require('chai').expect,
  conf = require('./conf'),
  WhmcsError = require('../lib/whmcserror');

function isModuleNotAssignedError(msg) {
  let possibleErr = ['Service not assigned to a module', 'Server response message'];
  return possibleErr.some(err => { return msg.indexOf(err) > -1 });
}

describe('Module "Service"', function () {
  let demoPid, demoOrderId, demoServiceId;

  before(async function () {
    const _this = this;
    this.timeout(30000);

    let productOpts = {
      name: 'Test product',
      gid: process.env.WHMCS_TEST_GID || '1',
      type: 'hostingaccount',
    };

    let productRes;

    try {
      productRes = await conf.whmcs.products.addProduct(productOpts);
    } catch (e) {
      if (e.message.indexOf('You must supply a valid Product Group ID') > -1) {
        console.log('There is no Product Group #' + productOpts.gid + '. You must create a Product Group in WHMCS and set the environment variable "WHMCS_TEST_GID" in order to proceed with the test.');
        _this.skip();
      } else {
        throw e;
      }
    }

    expect(productRes).to.have.a.property('result').to.equal('success');
    expect(productRes).to.have.a.property('pid').to.not.be.null;
    demoPid = productRes.pid;

    let orderOpts = {
      clientid: conf.demoClientId,
      paymentmethod: conf.demoPaymentMethod,
      'pid[0]': demoPid,
      'domain[0]': 'hostingtest.com',
      'billingcycle[0]': 'monthly',
      'priceoverride[0]': 1
    };
    let orderRes = await conf.whmcs.orders.addOrder(orderOpts);
    expect(orderRes).to.have.a.property('result').to.equal('success');
    expect(orderRes).to.have.a.property('orderid').to.not.be.null;
    demoOrderId = orderRes.orderid;

    let productsOpts = {
      domain: 'hostingtest.com',
      limitstart: 0,
      limitnum: 1
    };
    let productsRes = await conf.whmcs.client.getClientsProducts(productsOpts);
    expect(productsRes).to.have.a.property('result').to.equal('success');
    expect(productsRes).to.have.a.property('products').to.be.an('object').to.have.a.property('product').to.be.an('array');
    expect(productsRes.products.product[0]).to.have.a.property('id').to.be.a('string');
    demoServiceId = productsRes.products.product[0].id;
  });

  it('should update a client service', async function () {
    let opts = {
      serviceid: demoServiceId,
      notes: 'this service was updated'
    };
    let res = await conf.whmcs.service.updateClientProduct(opts);
    expect(res).to.have.a.property('result').to.equal('success');
  });

  it('should run the module create', async function () {
    let opts = {
      serviceid: demoServiceId
    };

    try {
      let res = await conf.whmcs.service.moduleCreate(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    }
    catch (e) {
      if (e instanceof WhmcsError) {
        expect(isModuleNotAssignedError(e.message)).to.be.true;
      } else {
        throw e;
      }
    }
  });

  it('should run the change package action', async function () {
    let opts = {
      serviceid: demoServiceId
    };

    try {
      let res = await conf.whmcs.service.moduleChangePackage(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    }
    catch (e) {
      if (e instanceof WhmcsError) {
        expect(isModuleNotAssignedError(e.message)).to.be.true;
      } else {
        throw e;
      }
    }
  });

  it('should run the change pw action', async function () {
    let opts = {
      serviceid: demoServiceId
    };

    try {
      let res = await conf.whmcs.service.moduleChangePw(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    }
    catch (e) {
      if (e instanceof WhmcsError) {
        expect(isModuleNotAssignedError(e.message)).to.be.true;
      } else {
        throw e;
      }
    }
  });

  it('should run a custom module action', async function () {
    let opts = {
      serviceid: demoServiceId,
      func_name: 'test'
    };

    try {
      let res = await conf.whmcs.service.moduleCustom(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    }
    catch (e) {
      if (e instanceof WhmcsError) {
        expect(isModuleNotAssignedError(e.message)).to.be.true;
      } else {
        throw e;
      }
    }
  });

  it('should run the module suspend action', async function () {
    let opts = {
      serviceid: demoServiceId
    };

    try {
      let res = await conf.whmcs.service.moduleSuspend(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    }
    catch (e) {
      if (e instanceof WhmcsError) {
        expect(isModuleNotAssignedError(e.message)).to.be.true;
      } else {
        throw e;
      }
    }
  });

  it('should run the module unsuspend action', async function () {
    let opts = {
      serviceid: demoServiceId
    };

    try {
      let res = await conf.whmcs.service.moduleUnsuspend(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    }
    catch (e) {
      if (e instanceof WhmcsError) {
        expect(isModuleNotAssignedError(e.message)).to.be.true;
      } else {
        throw e;
      }
    }
  });

  it('should update or calculate an upgrade on a product', async function () {
    let opts = {
      serviceid: demoServiceId,
      type: 'product',
      calconly: true,
      newproductid: demoPid,
      newproductbillingcycle: 'monthly'
    };

    try {
      let res = await conf.whmcs.service.upgradeProduct(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    } catch (e) {
      if (e instanceof WhmcsError) {
        expect(e.message).to.have.string('Invalid Billing Cycle Requested');
      } else {
        throw e;
      }
    }
  });

});