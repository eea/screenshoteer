#!/usr/bin/env node
/* global require, GLOBAL, __dirname, console, process, module */
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const program = require('commander');

program
    .option('--url, [url]', 'The url')
    .option('--emulate, [emulate]', 'emulate device')
    .option('--fullpage, [fullpage]', 'Full Page')
    .option('--pdf, [pdf]', 'Generate PDF')
    .option('--w, [w]', 'width')
    .option('--h, [h]', 'height')
    .option('--waitfor, [waitfor]', 'Wait time in milliseconds')
    .option('--waitforselector, [waitforselector]', 'Wait for the selector to appear in page')
    .option('--el, [el]', 'element css selector')
    .option('--auth, [auth]', 'Basic HTTP authentication')
    .option('--no, [no]', 'Exclude')
    .option('--click, [click]', 'Click')
    .option('--file, [file]', 'Output file')
    .parse(process.argv);

async function screenshoteer (options) {
    try {
        if (options === undefined) {
            if (!program.url) {
              console.log('Please add --url parameter.\n' +
                          'Something like this: $ screenshoteer --url http://www.example.com');
              process.exit();
            }

            !program.fullpage ? program.fullPage = true : program.fullPage = JSON.parse(program.fullpage);

            console.log(program.url);
            console.log(program.fullPage);

            options = program;
        }
        await execute(options);
    } catch(e) {
        console.error(e);
        if (options === undefined) {
            process.exit(1);
        }
        else {
            throw(e);
        }
    }

    async function execute(options) {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        if (options.no) {
          await page.setRequestInterception(true);
          page.on('request', request => {
              if (request.resourceType() === options.no)
              request.abort();
              else
              request.continue();
          });
        }
        const timestamp = new Date().getTime();
        if (options.w || options.h) {
            const newWidth = !options.w?600:options.w
            const newHeight = !options.h?'0':options.h
            if (options.h && !options.fullpage) options.fullPage = false;
            await page.setViewport({width: Number(newWidth), height: Number(newHeight)})
        }
        if (options.emulate)
            await page.emulate(devices[options.emulate]);
        else
            options.emulate = '';

        if (options.auth) {
          const [username, password] = options.auth.split(';');
          await page.authenticate({ username, password });
        }
        await page.goto(options.url, {waitUntil: 'networkidle2'});
        const title = (await page.title()).replace(/[/\\?%*:|"<>]/g, '-');
        if (options.waitfor) await page.waitFor(Number(options.waitfor));
        if (options.waitforselector) await page.waitForSelector(options.waitforselector);
        if (options.click) await page.click(options.click);
        const file = options.file ? options.file : `${title} ${options.emulate} ${options.el} ${timestamp}.png`;
        if (options.el) {
            const el = await page.$(options.el);
            await el.screenshot({path: file});
        } else {
            try {
                if (options.pdf) {
                    // await page.emulateMedia('screen');
                    await page.pdf({path: file, format: 'A4'});
                }
                else {
                    await page.screenshot({path: file, fullPage: options.fullPage});
                }
            }
            catch(err){
                console.log(err);
            }
        }
        console.log(title);
        await browser.close();
    }
}

module.exports = screenshoteer;
