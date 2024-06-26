const expect = require('chai').expect,
  conf = require('./conf'),
  WhmcsError = require('../lib/whmcserror');

describe('Module "Billing"', function () {

  describe('Quote', function () {
    let demoQuoteId;

    before(async function () {
      const opts = {
        subject: 'test quote',
        stage: 'Draft',
        validuntil: '01-01-2099',
        userid: conf.demoClientId
      };

      const items = {
        'lineitems[0]': {
          desc: 'quote description',
          qty: 1,
          up: 10,
          taxable: false
        }
      };

      opts['lineitems'] = Buffer.from(conf.serialize(items), 'ascii').toString('base64');

      const res = await conf.whmcs.billing.createQuote(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('quoteid').to.not.be.null;
      demoQuoteId = res.quoteid;
    });

    it('should get quotes', async function () {
      const opts = {
        limitstart: 0,
        limitnum: 1
      };

      const res = await conf.whmcs.billing.getQuotes(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('quotes').to.be.an('object');
      expect(res.quotes).to.have.a.property('quote').to.be.an('array');
    });

    it('should create a quote', async function () {
      const opts = {
        subject: 'test quote',
        stage: 'Draft',
        validuntil: '01-01-2099',
        userid: conf.demoClientId
      };

      const items = {
        'lineitems[0]': {
          desc: 'quote description',
          qty: 1,
          up: 10,
          taxable: false
        }
      };

      opts['lineitems'] = Buffer.from(conf.serialize(items), 'ascii').toString('base64');

      const res = await conf.whmcs.billing.createQuote(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('quoteid').to.not.be.null;
    });

    it('should get a quote by id', async function () {
      const opts = {
        quoteid: demoQuoteId
      };

      const res = await conf.whmcs.billing.getQuotes(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('quotes').to.be.an('object');
      expect(res.quotes).to.have.a.property('quote').to.be.an('array').to.have.lengthOf(1);
    });

    it('should update a quote', async function () {
      const opts = {
        quoteid: demoQuoteId,
        subject: 'this is an updated quote'
      };

      const res = await conf.whmcs.billing.updateQuote(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    });

    it('should accept a quote', async function () {
      this.timeout(30000);
      const opts = {
        quoteid: demoQuoteId,
      };

      const res = await conf.whmcs.billing.acceptQuote(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('invoiceid').to.not.be.null;
    });

    it('should send a quote', async function () {
      const opts = {
        quoteid: demoQuoteId,
      };

      const res = await conf.whmcs.billing.sendQuote(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    });

    it('should delete a quote', async function () {
      const opts = {
        quoteid: demoQuoteId,
      };

      const res = await conf.whmcs.billing.deleteQuote(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    });
  });

  it('should add a billable item', async function () {
    const opts = {
      clientid: conf.demoClientId,
      description: 'this is a billable item',
      amount: '10.00',
      unit: 'quantity'
    };

    const res = await conf.whmcs.billing.addBillableItem(opts);
    expect(res).to.have.a.property('result').to.equal('success');
    expect(res).to.have.a.property('billableid').to.not.be.null;
  });

  it('should create an invoice', async function () {
    this.timeout(30000);
    const opts = {
      userid: conf.demoClientId,
      itemdescription0: 'this is a test invoice',
      itemamount0: 1,
      autoapplycredit: false
    };

    const res = await conf.whmcs.billing.createInvoice(opts);
    expect(res).to.have.a.property('result').to.equal('success');
    expect(res).to.have.a.property('invoiceid').to.not.be.null;
  });

  it('should get invoices', async function () {
    const opts = {
      limitstart: 0,
      limitnum: 1
    };

    const res = await conf.whmcs.billing.getInvoices(opts);
    expect(res).to.have.a.property('result').to.equal('success');
    expect(res).to.have.a.property('invoices').to.be.an('object');
    expect(res.invoices).to.have.a.property('invoice').to.be.an('array');
  });

  describe('Invoice', function () {
    let demoInvoiceId;

    before(async function () {
      const opts = {
        userid: conf.demoClientId,
        itemdescription0: 'this is a test invoice',
        itemamount0: 1,
        autoapplycredit: false
      };

      const res = await conf.whmcs.billing.createInvoice(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('invoiceid').to.be.a('number');
      demoInvoiceId = res.invoiceid;
    });

    it('should update an invoice', async function () {
      const opts = {
        invoiceid: demoInvoiceId,
        'itemdescription[0]': 'this is an updated invoice',
        'itemamount[0]': 1,
        'itemtaxed[0]': false
      };

      const res = await conf.whmcs.billing.updateInvoice(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('invoiceid').to.equal(demoInvoiceId);
    });

    it('should get an invoice', async function () {
      const opts = {
        invoiceid: demoInvoiceId
      };

      const res = await conf.whmcs.billing.getInvoice(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('items').to.be.an('object');
      expect(res.items).to.have.a.property('item').to.be.an('array').to.have.lengthOf(1);
    });

    it('should add a payment to an invoice', async function () {
      const opts = {
        invoiceid: demoInvoiceId,
        transid: 1234,
        amount: 0.01,
        gateway: 'paypal'
      };

      const res = await conf.whmcs.billing.addInvoicePayment(opts);
      expect(res).to.have.a.property('result').to.equal('success');
    });

    it('should apply credit to an invoice', async function () {
      const opts = {
        invoiceid: demoInvoiceId,
        amount: 0.01,
        noemail: true
      };
      let res;

      try {
        res = await conf.whmcs.billing.applyCredit(opts);
        expect(res).to.have.a.property('result').to.equal('success');
        expect(res).to.have.a.property('invoicepaid').to.not.be.null;
      } catch (e) {
        if (e instanceof WhmcsError) {
          const possibleErr = ['Amount exceeds customer credit balance'];
          expect(possibleErr.indexOf(e.message) > -1).to.be.true;
        } else {
          throw e;
        }
      }
    });

    it('should capture payment on an unpaid invoice', async function () {
      const opts = {
        invoiceid: demoInvoiceId
      };
      let res;

      try {
        res = await conf.whmcs.billing.capturePayment(opts);
        expect(res).to.have.a.property('result').to.equal('success');
      } catch (e) {
        if (e instanceof WhmcsError) {
          const possibleErr = ['Payment Attempt Failed'];
          expect(possibleErr.indexOf(e.message) > -1).to.be.true;
        } else {
          throw e;
        }
      }
    });
  });

  describe('Pay Method', function () {
    let demoPaymentMethodId;

    before(async function () {
      const opts = {
        clientid: conf.demoClientId,
        type: 'BankAccount',
        bank_code: '123456789',
        bank_code: '1234',
        bank_account: '999999999'
      };

      const res = await conf.whmcs.billing.addPayMethod(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('paymethodid').to.not.be.null;
      demoPaymentMethodId = res.paymethodid;
    });

    it('should add a pay method to given client', async function () {
      const opts = {
        clientid: conf.demoClientId,
        type: 'BankAccount',
        bank_code: '123456789',
        bank_code: '1234',
        bank_account: '999999999'
      };

      const res = await conf.whmcs.billing.addPayMethod(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('paymethodid').to.not.be.null;
    });

    it('should get pay methods associated with client id', async function () {
      const opts = {
        clientid: conf.demoClientId,
        paymethodid: demoPaymentMethodId
      };

      const res = await conf.whmcs.billing.getPayMethods(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('paymethods').to.be.an('array').to.have.lengthOf(1);

    });

    it('should update a pay method', async function () {
      const opts = {
        clientid: conf.demoClientId,
        paymethodid: demoPaymentMethodId
      };

      const res = await conf.whmcs.billing.updatePayMethod(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('paymethodid').to.not.be.null;

    });

    it('should delete a pay method', async function () {
      const opts = {
        clientid: conf.demoClientId,
        paymethodid: demoPaymentMethodId
      };

      const res = await conf.whmcs.billing.deletePayMethod(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('paymethodid').to.not.be.null;
    });
  });

  it('should generate invoices that are due to be generated', async function () {
    this.timeout(30000);
    const opts = {
      clientid: conf.demoClientId
    };
    const res = await conf.whmcs.billing.genInvoices(opts);
    expect(res).to.have.a.property('result').to.equal('success');
    expect(res).to.have.a.property('numcreated').to.not.be.null;
  });

  describe('Credit', function () {
    it('should add credit', async function () {
      const opts = {
        clientid: conf.demoClientId,
        description: 'this is a credit test',
        amount: 1
      };

      const res = await conf.whmcs.billing.addCredit(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('newbalance').to.not.be.null;
    });

    it('should get credits', async function () {
      const opts = {
        clientid: conf.demoClientId
      };

      const res = await conf.whmcs.billing.getCredits(opts);
      expect(res).to.have.a.property('result').to.equal('success');
      expect(res).to.have.a.property('credits').to.be.an('object');
      expect(res.credits).to.have.a.property('credit').to.be.an('array');
    });
  });

  describe('Transaction', function () {
    it('should add, get and update a transaction', async function () {
      const addOpts = {
        paymentmethod: conf.demoPaymentMethod,
        userid: conf.demoClientId
      };

      const addRes = await conf.whmcs.billing.addTransaction(addOpts);
      expect(addRes).to.have.a.property('result').to.equal('success');

      const getOpts = {
        clientid: conf.demoClientId
      };

      const getRes = await conf.whmcs.billing.getTransactions(getOpts);
      expect(getRes).to.have.a.property('result').to.equal('success');
      expect(getRes).to.have.a.property('transactions').to.be.an('object');
      expect(getRes.transactions).to.have.a.property('transaction').to.be.an('array').to.have.length.greaterThan(0);
      expect(getRes.transactions.transaction[0]).to.have.a.property('id').to.not.be.null;

      const updateOpts = {
        transactionid: getRes.transactions.transaction[0].id,
        description: 'this transaction has been updated'
      };

      const updateRes = await conf.whmcs.billing.updateTransaction(updateOpts);
      expect(updateRes).to.have.a.property('result').to.equal('success');
      expect(updateRes).to.have.a.property('transactionid').to.equal(getRes.transactions.transaction[0].id);
    });
  });

});