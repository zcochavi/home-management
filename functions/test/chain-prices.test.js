'use strict';
const test = require('node:test');
const assert = require('node:assert');
const zlib = require('zlib');
const cp = require('../chain-prices-helpers');

test('listingLinks: download links, each file once, &amp; decoded', () => {
  const html = `<a href="https://x.blob.core.windows.net/prices/PriceFull7290700100008-001-012-202611270300.gz?sv=1&amp;sig=2">a</a>
    <a href="https://x.blob.core.windows.net/prices/PriceFull7290700100008-001-012-202611270300.gz?sv=1&amp;sig=2">dup</a>
    <a href="/Prices?p=2">next</a><a href="https://x/Stores7290700100008-000-202611270100.xml">s</a>`;
  const l = cp.listingLinks(html);
  assert.deepStrictEqual(l.map(x => x.name), ['PriceFull7290700100008-001-012-202611270300.gz', 'Stores7290700100008-000-202611270100.xml']);
  assert.ok(l[0].url.endsWith('sv=1&sig=2'));
});

test('parseFilename: type, store and time in the layouts chains use', () => {
  assert.deepStrictEqual(cp.parseFilename('PriceFull7290700100008-001-012-202611270300.gz'),
    { type: 'PriceFull', storeId: '012', ts: Date.UTC(2026, 10, 27, 3, 0, 0) });
  assert.deepStrictEqual(cp.parseFilename('PriceFull7290027600007-001-001-20260824-030000.gz'),
    { type: 'PriceFull', storeId: '001', ts: Date.UTC(2026, 7, 24, 3, 0, 0) });
  const p = cp.parseFilename('Price7290700100008-012-202611271000.gz');
  assert.strictEqual(p.type, 'Price'); assert.strictEqual(p.storeId, '012');
  assert.strictEqual(cp.parseFilename('PromoFull7290700100008-001-012-202611270300.gz').type, 'PromoFull');
  assert.strictEqual(cp.parseFilename('Stores7290700100008-000-202611270100.xml').type, 'Stores');
  assert.ok(cp.sameStore('12', '012') && !cp.sameStore('12', '013'));
});

test('toText: gzip, utf-16 and BOM', () => {
  assert.strictEqual(cp.toText(zlib.gzipSync(Buffer.from('<a>שלום</a>'))), '<a>שלום</a>');
  assert.strictEqual(cp.toText(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('<a>חלב</a>', 'utf16le')])), '<a>חלב</a>');
  assert.strictEqual(cp.toText(Buffer.from('﻿<a/>', 'utf8')), '<a/>');
});

test('toText: windows-1255 Hebrew', () => {
  const hebrew = Buffer.from([0xe0, 0xed, 0x20, 0xe4, 0xee, 0xe5, 0xf9, 0xe1, 0xe5, 0xfa]); // "אם המושבות"
  const declared = Buffer.concat([Buffer.from('<?xml version="1.0" encoding="windows-1255"?><a>'), hebrew, Buffer.from('</a>')]);
  assert.ok(cp.toText(declared).includes('אם המושבות'));
  const undeclared = Buffer.concat([Buffer.from('<a>'), hebrew, Buffer.from('</a>')]);
  assert.strictEqual(cp.toText(undeclared), '<a>אם המושבות</a>');
});

test('parseStores / findStore', () => {
  const xml = `<Root><ChainId>7290700100008</ChainId><SubChains><SubChain><Stores>
    <Store><StoreId>12</StoreId><StoreName>אם המושבות</StoreName><Address>רח' ספיר 3</Address><City>פתח תקווה</City></Store>
    <Store><StoreId>7</StoreId><StoreName>חולון</StoreName><Address>המלאכה 1</Address><City>חולון</City></Store>
    <Store><STOREID>9</STOREID><STORENAME>פ"ת - סגולה</STORENAME><CITY>פתח תקווה</CITY></Store>
  </Stores></SubChain></SubChains></Root>`;
  const s = cp.parseStores(xml);
  assert.deepStrictEqual(s.map(x => x.storeId), ['12', '7', '9']);
  assert.deepStrictEqual(cp.findStore(s, 'אם המושבות, פתח תקווה').map(x => x.storeId), ['12']);
  assert.deepStrictEqual(cp.findStore(s, 'פתח תקווה').map(x => x.storeId), ['12', '9']);
});

test('parsePrices / searchProducts', () => {
  const xml = `<root><Items>
    <Item><ItemCode>7290004131074</ItemCode><ItemName>חלב תנובה 3% 1 ליטר</ItemName><ManufacturerName>תנובה</ManufacturerName>
      <ItemPrice>7.10</ItemPrice><UnitOfMeasurePrice>7.10</UnitOfMeasurePrice><UnitOfMeasure>ליטר</UnitOfMeasure><Quantity>1</Quantity><bIsWeighted>0</bIsWeighted></Item>
    <Item><ItemCode>2000123</ItemCode><ItemName>עגבניות &amp; שרי</ItemName><ItemPrice>12.90</ItemPrice><bIsWeighted>1</bIsWeighted></Item>
    <Item><ItemCode>5</ItemCode><ItemName>בלי מחיר</ItemName></Item>
  </Items></root>`;
  const items = cp.parsePrices(xml);
  assert.strictEqual(items.length, 2);
  assert.deepStrictEqual([items[0].price, items[0].maker, items[0].weighted, items[1].name, items[1].weighted], [7.1, 'תנובה', false, 'עגבניות & שרי', true]);
  assert.deepStrictEqual(cp.searchProducts(items, 'חלב 3%').map(i => i.code), ['7290004131074']);
  assert.deepStrictEqual(cp.searchProducts(items, 'תנובה').map(i => i.code), ['7290004131074']);
  assert.deepStrictEqual(cp.searchProducts(items, ''), []);
});

test('rankProducts: the plain product before variants, free items left out', () => {
  const it = (code, name, price = 5) => ({ code, name, price });
  const items = [it('1', 'ריבת חלב'), it('2', 'חלב מרוכז'), it('3', 'חלב 3% 1 ליטר'), it('4', 'חלב סויה וניל'), it('5', 'חלב חינם', 0), it('6', 'שומשום'), it('7', 'שום קלוף')];
  assert.deepStrictEqual(cp.rankProducts(items, 'חלב').map(i => i.code), ['3', '2', '4', '1']);
  assert.deepStrictEqual(cp.rankProducts(items, 'חלב סויה').map(i => i.code), ['4']);
  assert.deepStrictEqual(cp.rankProducts(items, 'שום').map(i => i.code), ['7', '6']);
  assert.deepStrictEqual(cp.rankProducts(items, ' '), []);
});

test('storeLabel: city from its code, the address without the city and country', () => {
  assert.strictEqual(cp.storeLabel({ storeId: '209', city: '7900', address: 'ראשון לציון 1 , פ"ת , ישראל' }), 'פתח תקווה · ראשון לציון 1');
  assert.strictEqual(cp.storeLabel({ storeId: '206', city: '9700', address: 'הרקון 2 הוד השרון' }), 'הוד השרון · הרקון 2 הוד השרון');
  assert.strictEqual(cp.storeLabel({ storeId: '9', city: '1', address: '' }), 'סניף 9');
});

test('Shufersal: listing URL by branch, file names, the uppercase Stores file', () => {
  const S = cp.CHAINS.shufersal;
  assert.strictEqual(S.listUrl('prices', 1, '413'), 'https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=413&page=1');
  assert.strictEqual(S.listUrl('stores', 2), 'https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=5&storeId=0&page=2');
  assert.strictEqual(cp.CHAINS['hatzi-hinam'].listUrl('prices', 3), 'https://shop.hazi-hinam.co.il/Prices?t=1&p=3');
  const f = cp.parseFilename('PriceFull7290027600007-413-202611270300.gz');
  assert.deepStrictEqual([f.type, f.storeId, f.ts], ['PriceFull', '413', Date.UTC(2026, 10, 27, 3, 0, 0)]);
  const links = cp.listingLinks('<a href="https://pricesprodpublic.blob.core.windows.net/pricefull/PriceFull7290027600007-413-202611270300.gz?sv=2014&amp;sig=x">x</a>');
  assert.strictEqual(links[0].url, 'https://pricesprodpublic.blob.core.windows.net/pricefull/PriceFull7290027600007-413-202611270300.gz?sv=2014&sig=x');
  const xml = `<asx:abap><asx:values><STORES>
    <STORE><CHAINID>7290027600007</CHAINID><SUBCHAINID>2</SUBCHAINID><STOREID>413</STOREID><SUBCHAINNAME>שופרסל דיל</SUBCHAINNAME>
      <STORENAME>שופרסל דיל פתח תקווה</STORENAME><ADDRESS>ז'בוטינסקי 72</ADDRESS><CITY>פתח תקווה</CITY></STORE>
    <STORE><STOREID>5</STOREID><SUBCHAINNAME>שופרסל שלי</SUBCHAINNAME><STORENAME>שלי רמת אביב</STORENAME><ADDRESS>איינשטיין 40</ADDRESS><CITY>תל אביב</CITY></STORE>
  </STORES></asx:values></asx:abap>`;
  const stores = cp.parseStores(xml);
  assert.deepStrictEqual(stores.map(s => [s.storeId, s.subChainName, s.city]), [['413', 'שופרסל דיל', 'פתח תקווה'], ['5', 'שופרסל שלי', 'תל אביב']]);
  assert.deepStrictEqual(stores.map(cp.storeLabel), ['שופרסל דיל פתח תקווה', 'תל אביב · שלי רמת אביב']);
});
