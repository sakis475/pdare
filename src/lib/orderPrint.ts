import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;
export async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    console.log('Browser ', await browser.version(), ' is running!');
    await page.setViewport({ width: 380, height: 50 });
  }
}

export async function htmlStringToImageBuffer(htmlString: string) {
  // Set the HTML content

  await page.setContent(htmlString, {
    waitUntil: 'domcontentloaded', // Ensures that all resources are loaded
  });

  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();

  // Adjust the viewport to the actual height of the body
  await page.setViewport({ width: 371, height: Math.ceil(height) });

  const imageBuffer = await page.screenshot({ fullPage: true });

  return imageBuffer;
}

function buildOrderItem(orderItem: OrderPrintItem) {
  return `
  <div class="orderItem">
    <div class="item">
      <p class="itemTitle FONTSIZE_3_5">${orderItem.itemTitle}</p>
      ${
        orderItem.itemDetails
          ? `<p class="FONTSIZE_2_5">${orderItem.itemDetails}</p>`
          : ''
      }
      ${
        orderItem.itemComment
          ? `<p class="FONTSIZE_2_5"><i>${orderItem.itemComment}</i></p>`
          : ''
      }
    </div>

    <div class="quantity" style="text-align: right">
      <p class="itemTitle FONTSIZE_3_5">x${orderItem.quantity}</p>
      <p class="FONTSIZE_2_5">${orderItem.price}</p>
    </div>
  </div>
  `;
}

export function buildHtml(
  order: OrderPrintOrder,
  config = {
    textMagnifierValue: 3,
    topMargin: 50,
    bottomMargin: 150,
    fontFamily: `Arial`,
    currency: '€',
    language: 'el',
  }
) {
  const FONTSIZE_3_5 = 3.5 * config.textMagnifierValue;
  const FONTSIZE_3_0 = 3 * config.textMagnifierValue;
  const FONTSIZE_2_5 = 2.5 * config.textMagnifierValue;
  const FONTSIZE_2_0 = 2 * config.textMagnifierValue;

  const orderListToHTML = order.orderItems.map(buildOrderItem).join('<hr>');

  const htmlTemplate = `
  <html>
    <head>
      <style>
        body {
          margin: 0;
          // width: 369px;
          font-family: ${config.fontFamily};
        }
        p {
          margin: 0;
        }
        hr {
          border: none;
          height: 3px;
          background-color: black;
          margin-top: 2vw;
          margin-bottom: 2vw;
        }
        .container {
          padding: ${config.topMargin}px 2px ${config.bottomMargin}px 2px;
          
        }
        .topHeader {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
  
        .orderList {
          margin-top: 8vw;
          margin-left: 5px;
          margin-right: 5px;
        }
        .orderItem {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4vw;
        }
        .item {
          flex-grow: 1;
        }
  
        .quantity {
          flex-shrink: 0;
        }
        
        .itemTitle {
         font-weight: bold
        }
        
        .FONTSIZE_3_5{
          font-size: ${FONTSIZE_3_5}vw
        }
  
        .FONTSIZE_3_0{
          font-size: ${FONTSIZE_3_0}vw
        }
  
        .FONTSIZE_2_5{
          font-size: ${FONTSIZE_2_5}vw
        }
  
        .FONTSIZE_2_0{
          font-size: ${FONTSIZE_2_0}vw
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="topHeader FONTSIZE_3_0">
          <p>Παρ. <span>${order.orderDetails.orderId}</span><span>~${order.orderDetails.printNum}</span></p>
          <p style="text-align: right"><span>Τραπέζι</span></p>
        </div>
        <div style="display: flex; justify-content: space-between;" class="FONTSIZE_3_0">
          <p >Χρήστης: ${order.orderDetails.userName}</p>
          <p style="text-align: right; font-weight: bold;">
            ${order.orderDetails.tableName}
          </p>
        </div>
  
        <div class="orderList">
          ${orderListToHTML}
        </div>
  
        </div>
      </div>
    </body>
  </html>
  `;

  return htmlTemplate;
}

export const testPrintData = {
  orderId: '#2',
  printNum: '1',
  user: { name: 'Παναγιώτης Χρήστου' },
  table: { name: 'ΕΞΩ 24' },

  orderList: [
    {
      itemTitle: 'Freddo espresso',
      itemDetails: 'Xlarge, Μέτριος, Mrs.Rose',
      quantity: 1,
      price: 3.2,
    },
    {
      itemTitle: 'Freddo espresso',
      itemDetails: 'Xlarge, Μέτριος, Mrs.Rose',
      quantity: 1,
      price: 3.2,
    },
    {
      itemTitle: 'Freddo espresso',
      itemDetails: 'Σκέτος',
      itemComment: 'Με πλαστικά καλαμάκια αν υπάρχουν',
      quantity: 2,
      price: 1.9,
    },
  ],
};

export type OrderPrintItem = {
  itemTitle: string;
  itemDetails: string;
  itemComment: string;
  quantity: string;
  price: string;
};

export type OrderDetails = {
  orderId: number;
  printNum: number;
  userName: string;
  tableName: string;
};

type OrderPrintOrder = {
  orderDetails: OrderDetails;
  orderItems: OrderPrintItem[];
};
