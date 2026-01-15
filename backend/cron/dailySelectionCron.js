const cron = require('node-cron');
const Class = require('../models/Class');

const { runDailySelectionForClass } = require('../services/selectionService');
const { generateDailyFineForClass } = require('../services/fineService');
const { isSunday, isHoliday } = require('../services/dateService');

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function startDailySelectionCron() {
  cron.schedule(
    '32 13 * * *', // 1:32 PM IST
    async () => {
      const now = new Date();
      const todayStr = getToday();

      console.log(`⏰ Daily COTD Job Started (${todayStr})`);

      /* =========================
         0. GLOBAL SUNDAY CHECK
      ========================= */
      if (isSunday(now)) {
        console.log('⛔ Sunday — job skipped');
        return;
      }

      try {
        const classes = await Class.find({});

        for (const cls of classes) {
          /* =========================
             1. HOLIDAY CHECK (PER CLASS)
          ========================= */
          const holiday = await isHoliday(todayStr, cls._id);
          if (holiday) {
            console.log(`⛔ Holiday for class ${cls.name} — skipped`);
            continue;
          }

          /* =========================
             2. RUN SELECTION
          ========================= */
          const result = await runDailySelectionForClass(cls._id);

          if (result?.status === 'SELECTED') {
            console.log(
              `🎯 Selected for ${cls.name}: ${result.name}`
            );
          } else {
            console.log(
              `ℹ️ No eligible student for ${cls.name}`
            );
          }

          /* =========================
             3. RUN FINE LOGIC
             (only after selection attempt)
          ========================= */
          await generateDailyFineForClass(cls._id);
        }

        console.log('✅ Daily Selection + Fine completed');

      } catch (err) {
        console.error('❌ Daily Cron Error:', err);
      }
    },
    {
      timezone: 'Asia/Kolkata'
    }
  );
}

module.exports = startDailySelectionCron;
