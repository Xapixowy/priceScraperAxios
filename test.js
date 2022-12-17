import axios from 'axios';
import got from 'got';
import cheerio from 'cheerio';
import { Product, Scraper } from './modules/pricescraper.js';
import fs from 'fs';

const cpu1 = new Product('Intel Core i5 13600KF', {
   media: 'https://www.mediaexpert.pl/komputery-i-tablety/podzespoly-komputerowe/procesory/procesor-intel-core-i5-13600kf',
});

const selectors = {
   amazon: '.a-price>.a-offscreen',
   euro: '.product-price .price-normal',
   komputronik: '.prices .price .proper',
   media: '.price-box .prices .main-price',
   morele: '.product-price-container > .product-price',
   skapiec: '.price-history-modal-old-content__details .details-list__item:nth-of-type(1) .price',
   xkom: '.sc-n4n86h-4.jwVRpW',
};

const getShopPrice = async function (product, shop) {
   if (!product.links[shop]) return;
   console.log(`${shop}:`);

   console.log(`1) Getting website`);
   let start = new Date();
   const website = await axios
      .get(product.links[shop], {
         headers: {
            'Accept-Encoding': 'gzip,deflate,compress',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
         },
         responseType: 'document',
      })
      .catch((err) => console.log('ERROR: ', err, err.stack));
   // const website = await got.get(product.links[shop]).catch((err) => console.log('ERROR: ', err, err.stack));
   await fs.writeFile(`./websites/${shop}.html`, website, (err) =>
      err ? console.log(err) : console.log('File created!'),
   );
   let end = new Date();
   console.log(`1) Finished in ${(end - start) / 1000}s!`);

   start = new Date();
   console.log(`2) Scrapping website`);
   const document = await cheerio.load(website.data);
   console.log('PRICE:', document(selectors[shop]).first().text());
   const priceText = document(selectors[shop]).first().text();
   end = new Date();
   console.log(`2) Finished in ${(end - start) / 1000}s!`);

   start = new Date();
   console.log(`3) Normalizing price`);
   let priceString = priceText
      .replaceAll(String.fromCharCode(9), '')
      .replaceAll(String.fromCharCode(10), '')
      .replaceAll(String.fromCharCode(32), '')
      .replaceAll(String.fromCharCode(160), '')
      .replaceAll(',', '.')
      .replaceAll('zł', '');
   product.prices[shop] = parseFloat(priceString);
   end = new Date();
   console.log(`3) Finished in ${(end - start) / 1000}s!`);
};

await getShopPrice(cpu1, 'media');
console.log(cpu1);
