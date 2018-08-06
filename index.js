'use strict';

const chalk = require('chalk');
const puppeteer = require('puppeteer');
const readlineSync = require('readline-sync');
const Spinner = require('cli-spinner').Spinner;

const spinner = new Spinner('Currently printing... %s');

function autoScroll(page) {
    console.log(`${chalk.bold('Cool!')} We are currently scrolling the page to make sure everything is cool!`);

    spinner.setSpinnerString('|/-\\');
    spinner.start();

    return page.evaluate(() => {
        return new Promise(resolve => {
            let totalHeight = 0;
            const distance = 100;

            const timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        })
    });
}

(async () => {
    const url = readlineSync.question(`${chalk.white.bgMagenta.bold(' Hello there! ')} What is the ${chalk.bold.underline('URL')} you would like to print?\n${chalk.dim('Something like') + chalk.dim.underline(' https://sproutsocial.com/insights/data/q4-2017/')}\n${chalk.bold.underline('URL:')} `);

    console.log(`${chalk.bold('Okay!')} Lets go ahead and print\n${chalk.blue(url)}`);

    const splitURL = url.split('/');
    const pdfName = splitURL.pop() || splitURL.pop();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle2'
    });

    await page.addStyleTag({
        content: `
.AMPSiteHeader, .AMPSiteHeader * { display: none; }
.Post h1 { padding-right: 1in; } 
.Post .col._span-8 .Media { display: none; }
twittertweet { page-break-before: always; } 
iframe, image, .Paper { page-break-inside: avoid; }
.col + .col { margin-top: 2.222rem; }
`
    });

    await autoScroll(page);

    await page.pdf({
        path: `./${pdfName}.pdf`,
        format: 'A4',
        printBackground: true
    });

    spinner.stop();

    console.log(`\n${chalk.bgBlue.white.bold(' Woo Hoo! ')} You are all set! You can find your PDF at ${chalk.bold.underline(__dirname + '/' + pdfName + '.pdf')}`);

    await browser.close();
})();
