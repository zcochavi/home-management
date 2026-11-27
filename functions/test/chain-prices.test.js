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
