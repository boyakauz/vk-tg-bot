const { VK } = require('vk-io');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// =====================
// VK + TG
// =====================

const vk = new VK({
  token: 'vk1.a.HEBkgj-wRcn6dLn_X2l6IS9qMAa8VmiocNhAEDbkho8TYKaW9RYUrbmIz9wdV60gzf1lnqavmbdJN3sv8XvsFxMI1XScS-pBn6Qhdz3YYGP8bCbTws82MT-awfEkrdnrnc0ZFq1p6zjMI-smaElIbGyOjaqhNkRGtHnbCd7QFNdXJV62qqDmNTgtIr_p_8TswQGlsCiCYM5QbtjakkUH1g'
});

const tg = new TelegramBot(
  '8767708581:AAHIH8ZOKkXYpsJ7Ka13hcRJdjPOwLzPj_c',
  {
    polling: true
  }
);

const TG_CHAT_ID = '7951287634';

// =====================
// DATABASE
// =====================

let users = {};
let flood = {};

if (fs.existsSync('./users.json')) {

  users = JSON.parse(
    fs.readFileSync('./users.json')
  );
}

function saveUsers() {

  fs.writeFileSync(
    './users.json',
    JSON.stringify(users, null, 2)
  );
}

// =====================
// MENU
// =====================

async function sendMenu(userId) {

  await vk.api.messages.send({

    peer_id: userId,
    random_id: Date.now(),

    message:
'🎰 ЛОТЕРЕЯ МЕНЮ',

    keyboard: JSON.stringify({

      inline: false,

      buttons: [

        [
          {
            action: {
              type: 'text',
              label: '💳 РЕКВИЗАТЛАР'
            },
            color: 'positive'
          }
        ],

        [
          {
            action: {
              type: 'text',
              label: '🧾 ЧЕКНИ ЮБОРИШ'
            },
            color: 'primary'
          }
        ],

        [
          {
            action: {
              type: 'open_link',
              link:
'https://t.me/aka_uka_igra',

              label:
'📢 TELEGRAM КАНАЛ'
            }
          }
        ]

      ]
    })
  });
}

// =====================
// VK -> TG
// =====================

vk.updates.on(
'message_new',

async (context) => {

  try {

    if (context.isOutbox)
      return;

    const userId =
      context.senderId;

    const text =
      context.text || '';

    // =====================
    // ANTI FLOOD
    // =====================

    const now = Date.now();

    if (flood[userId]) {

      const diff =
        now - flood[userId];

      if (diff < 2000) {

        await vk.api.messages.send({

          peer_id: userId,
          random_id: Date.now(),

          message:
'⏳ Секинроқ ёзинг.'

        });

        return;
      }
    }

    flood[userId] = now;

    // =====================
    // DATABASE
    // =====================

    if (!users[userId]) {

      users[userId] = {

        id: userId,
        messages: 0

      };
    }

    users[userId].messages++;

    saveUsers();

    // =====================
    // START
    // =====================

    if (

      text.toLowerCase() === 'start' ||
      text.toLowerCase() === 'salom' ||
      text.toLowerCase() === 'strat'

    ) {

      await sendMenu(userId);

      return;
    }

    // =====================
    // REKVIZIT
    // =====================

    if (

      text === '💳 РЕКВИЗАТЛАР' ||
      text.toLowerCase() === 'rekvizit'

    ) {

      await vk.api.messages.send({

        peer_id: userId,
        random_id: Date.now(),

        message:
`💳 РЕКВИЗАТЛАР

👤 Шохидахон Омаджон Кизи
https://www.sberbank.com/sms/pbpn?requisiteNumber=40820810440150063821

👤 Назирахон Каримова
https://www.sberbank.com/sms/pbpn?requisiteNumber=40820810938046429955

👤 Холидабону Абдугаффар кизи
https://www.sberbank.com/sms/pbpn?requisiteNumber=40820810730062365210

👤 Мубинахон Зокир кизи Х
https://www.sberbank.com/sms/pbpn?requisiteNumber=40820810340150125665

👤 Алимова Омадхон Камилжановна
https://www.sberbank.com/sms/pbpn?requisiteNumber=40820810440150216720

✅ Тўловдан кейин чек юборинг`
      });

      return;
    }

    // =====================
    // CHEK
    // =====================

    if (

      text === '🧾 ЧЕКНИ ЮБОРИШ' ||
      text.toLowerCase() === 'chek'

    ) {

      await vk.api.messages.send({

        peer_id: userId,
        random_id: Date.now(),

        message:
'🧾 Чекни юборинг.\n\nTelegram username ва телефон рақам ёзинг.'

      });

      return;
    }

    // =====================
    // TG BUTTONS
    // =====================

    const tgButtons = {

      reply_markup: {

        inline_keyboard: [

          [
            {
              text:
'👤 VK PROFIL',

              url:
`https://vk.com/id${userId}`
            }
          ],

          [

            {
              text:
'✅ ТАСДИҚЛАНДИ',

              callback_data:
`accept_${userId}`
            },

            {
              text:
'⛔ ТАСДИҚЛАНМАДИ',

              callback_data:
`reject_${userId}`
            }

          ]

        ]
      }
    };

    // =====================
    // FILE
    // =====================

    if (
      context.hasAttachments('doc')
    ) {

      const docs =
        context.getAttachments('doc');

      const file = docs[0];

      await tg.sendDocument(

        TG_CHAT_ID,
        { url: file.url },

        {

          caption:
`📁 ЯНГИ FILE

👤 VK ID: ${userId}

📝 TEXT:
${text || 'yoq'}

📄 ${file.title}`,

          ...tgButtons

        }

      );

      return;
    }

    // =====================
    // PHOTO
    // =====================

    if (
      context.hasAttachments('photo')
    ) {

      const photos =
        context.getAttachments('photo');

      const photo = photos[0];

      const photoUrl =

        photo.sizes[
          photo.sizes.length - 1
        ].url;

      await tg.sendPhoto(

        TG_CHAT_ID,
        photoUrl,

        {

          caption:
`📸 ЯНГИ FOTO

👤 VK ID: ${userId}

📝 TEXT:
${text || 'yoq'}`,

          ...tgButtons

        }

      );

      return;
    }

    // =====================
    // TEXT
    // =====================

    await tg.sendMessage(

      TG_CHAT_ID,

`📨 ХАБАР

👤 VK ID: ${userId}

${text}`,

      tgButtons

    );

  } catch (error) {

    console.log(error);

  }

});

vk.updates.start();

console.log('SYSTEM STARTED');