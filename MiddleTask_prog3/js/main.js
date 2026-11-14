/*
 * main.js - מגישים בקשת רכש מלאה
 * כל הקוד רץ רק אחרי טעינת ה-DOM.
 * שימוש ב-let/const בלבד (לא var), לפי מה שנלמד בקורס.
 */
document.addEventListener("DOMContentLoaded", function () {

    /* ===================================================================
     * 1. נעילת ניווט: מקטע 3 (הטופס) - פריט הניווט "עכשיו תורכם" נעול
     *    עד ששלושת הזום-אינים (3.1-3.3) נפתחו לפחות פעם אחת כל אחד.
     * =================================================================== */

    // מזהי המודלים שחייבים להיפתח - מערך אחד, כדי שלא נכתוב 3 פעמים אותה לוגיקה
    const zoomModalIds = ["zoomModal1", "zoomModal2", "zoomModal3"];
    const openedZoomModals = new Set();

    const navLockedLink = document.getElementById("navLockedLink");
    const zoomOpenedCountEl = document.getElementById("zoomOpenedCount");

    function unlockNavIfAllOpened() {
        zoomOpenedCountEl.textContent = openedZoomModals.size;

        if (openedZoomModals.size === zoomModalIds.length) {
            navLockedLink.removeAttribute("aria-disabled");
            navLockedLink.removeAttribute("data-locked");
        }
    }

    // מאזין אחד לכל מודל (בלולאה, כדי לא לשכפל קוד), מופעל כשמודל נפתח בפועל
    zoomModalIds.forEach(function (modalId) {
        const modalEl = document.getElementById(modalId);
        modalEl.addEventListener("shown.bs.modal", function () {
            openedZoomModals.add(modalId);
            unlockNavIfAllOpened();
        });
    });

    // הגנה נוספת: כל עוד הקישור נעול, לחיצה עליו לא תגרום לגלילה/ניווט
    navLockedLink.addEventListener("click", function (e) {
        if (navLockedLink.hasAttribute("data-locked")) {
            e.preventDefault();
        }
    });


    /* ===================================================================
     * 2. מקטע 4 - שאלות הבנה (בדיקת בקשה)
     * =================================================================== */

    // --- שאלה 1: בחירה יחידה ---
    const q1CorrectAnswer = "לא";

    document.getElementById("checkQ1Btn").addEventListener("click", function () {
        const selected = document.querySelector('input[name="q1"]:checked');
        const feedbackEl = document.getElementById("q1Feedback");
        // אלמנט ההורה שמקבל את החיווי הוויזואלי (מסגרת+רקע), בנוסף לטקסט
        const blockEl = document.getElementById("q1Block");

        if (!selected) {
            feedbackEl.textContent = "יש לבחור תשובה.";
            blockEl.classList.remove("state-success", "state-error");
            return;
        }

        if (selected.value === q1CorrectAnswer) {
            feedbackEl.textContent = "נכון. בבקשה חסרים פרטים, והיא עוד לא אושרה על ידי מנהל הסניף. " +
                "בקשה כזו הייתה חוזרת אליכם להשלמה, וספירת 3 ימי העבודה הייתה מתחילה מחדש.";
            blockEl.classList.add("state-success");
            blockEl.classList.remove("state-error");
        } else {
            feedbackEl.textContent = "לא בדיוק. בדקו שוב כל שדה בטופס. בקשה עוברת לרכש רק כשכל השדות " +
                "מלאים והיא מאושרת על ידי מנהל הסניף. בקשה חסרה חוזרת אליכם להשלמה, וספירת 3 ימי " +
                "העבודה מתחילה מחדש.";
            blockEl.classList.add("state-error");
            blockEl.classList.remove("state-success");
        }
    });

    // --- שאלה 2: רב-ברירה ---
    const q2CorrectValues = ["reason", "sku"];

    document.getElementById("checkQ2Btn").addEventListener("click", function () {
        const checkboxes = document.querySelectorAll('#bdikat-bakasha input[type="checkbox"]');
        const feedbackEl = document.getElementById("q2Feedback");
        // אלמנט ההורה שמקבל את החיווי הוויזואלי (מסגרת+רקע), בנוסף לטקסט
        const blockEl = document.getElementById("q2Block");

        const selectedValues = [];
        checkboxes.forEach(function (box) {
            if (box.checked) {
                selectedValues.push(box.value);
            }
        });

        if (selectedValues.length === 0) {
            feedbackEl.textContent = "יש לבחור לפחות תשובה אחת.";
            blockEl.classList.remove("state-success", "state-error");
            return;
        }

        const hasWrongSelection = selectedValues.some(function (val) {
            return q2CorrectValues.indexOf(val) === -1;
        });

        if (hasWrongSelection) {
            feedbackEl.textContent = "לא בדיוק. חלק מהפרטים שבחרתם כבר מלאים בטופס. בדקו שוב: איזה " +
                "שדה ריק, ואיזה שדה מלא אבל לא מסביר מספיק?";
            blockEl.classList.add("state-error");
            blockEl.classList.remove("state-success");
            return;
        }

        const correctCount = selectedValues.filter(function (val) {
            return q2CorrectValues.indexOf(val) !== -1;
        }).length;

        if (correctCount === q2CorrectValues.length) {
            feedbackEl.textContent = "נכון. \"צריך\" לא מסביר לאן ילך הציוד ולמה, ובלי מק\"ט הרכש לא " +
                "יודע איזה לוח בדיוק להזמין. אחרי ההשלמה, הבקשה נשלחת לאישור מנהל הסניף, ואז רכז " +
                "הרכש יכול להתחיל לטפל בה.";
            blockEl.classList.add("state-success");
            blockEl.classList.remove("state-error");
        } else {
            feedbackEl.textContent = "כמעט. מצאתם פרט אחד שצריך להשלים, אבל יש עוד אחד. בדקו שוב את " +
                "הסבר הצורך ואת פרטי הפריט.";
            blockEl.classList.add("state-error");
            blockEl.classList.remove("state-success");
        }
    });


    /* ===================================================================
     * 3. מקטע 5 - תרגול מסכם: מסך מעבר -> חשיפת התרחיש והטופס
     * =================================================================== */

    const transitionScreen = document.getElementById("transitionScreen");
    const practiceScreen = document.getElementById("practiceScreen");

    document.getElementById("startPracticeBtn").addEventListener("click", function () {
        transitionScreen.classList.add("hide");
        practiceScreen.classList.remove("hide");
    });

    // תאריך הבקשה ממולא אוטומטית (היום), לפי הדרישה שהשדה לקריאה בלבד
    const dateField = document.getElementById("fDate");
    const today = new Date();
    const formattedDate = String(today.getDate()).padStart(2, "0") + "." +
        String(today.getMonth() + 1).padStart(2, "0") + "." + today.getFullYear();
    dateField.value = formattedDate;


    /* ===================================================================
     * 4. מקטע 5 - ולידציית טופס התרגול מול התרחיש
     *    כל שדה מוגדר פעם אחת במערך config, כדי לא לשכפל לוגיקת בדיקה.
     * =================================================================== */

    // תרחיש היעד: מזכיר/ת סניף אשדוד, ארון מתכת R11, מק"ט 55210, כמות 2
    const fieldChecks = [
        {
            id: "fFullName",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש למלא את שמכם המלא.",
            isWrong: function () { return false; }, // כל שם לא-ריק מתקבל (זה שם הלומד/ת)
            wrongMsg: ""
        },
        {
            id: "fRole",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש למלא את התפקיד שלכם.",
            isWrong: function (val) { return val.indexOf("מזכיר") === -1; },
            wrongMsg: "התפקיד לא תואם לתרחיש. בדקו שוב מה התפקיד שלכם."
        },
        {
            id: "fBranch",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש לבחור סניף מהרשימה.",
            isWrong: function (val) { return val !== "אשדוד"; },
            wrongMsg: "הסניף לא תואם לתרחיש. בדקו שוב באיזה סניף אתם עובדים."
        },
        {
            id: "fReason",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש לפרט את הסבר הצורך.",
            isWrong: function (val) { return val.trim().length < 15; },
            wrongMsg: "ההסבר קצר מדי. כתבו לאן ילך הציוד ולמה הוא נחוץ."
        },
        {
            id: "fItemName",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש לכתוב את שם הפריט.",
            isWrong: function (val) { return val.indexOf("ארון") === -1; },
            wrongMsg: "שם הפריט לא תואם לתרחיש. כתבו אותו כפי שהוא מופיע בקטלוג."
        },
        {
            id: "fSku",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש למלא את המק\"ט.",
            isWrong: function (val) {
                if (!/^\d+$/.test(val.trim())) {
                    return "notNumber";
                }
                return val.trim() !== "55210";
            },
            wrongMsg: "המק\"ט לא תואם לפריט. בדקו שוב בתרחיש.",
            notNumberMsg: "מק\"ט מכיל ספרות בלבד."
        },
        {
            id: "fQty",
            isEmpty: function (val) { return val.trim() === ""; },
            emptyMsg: "יש למלא כמות.",
            isWrong: function (val) {
                const num = Number(val);
                if (!Number.isInteger(num) || num <= 0) {
                    return "notPositiveInt";
                }
                return num !== 2;
            },
            wrongMsg: "הכמות לא תואמת לתרחיש. בדקו שוב כמה יחידות צריך להזמין.",
            notPositiveIntMsg: "יש להזין מספר שלם הגדול מ-0."
        }
    ];

    document.getElementById("practiceForm").addEventListener("submit", function (e) {
        e.preventDefault();

        let problemCount = 0;

        // מעבר על כל שדות התצורה בלולאה אחת - בלי לכתוב בדיקה נפרדת לכל שדה
        fieldChecks.forEach(function (check) {
            const inputEl = document.getElementById(check.id);
            const feedbackEl = document.querySelector('.field-feedback[data-for="' + check.id + '"]');
            const value = inputEl.value;

            if (check.isEmpty(value)) {
                feedbackEl.textContent = check.emptyMsg;
                // חיווי ויזואלי על השדה עצמו (מסגרת אדומה), בנוסף לטקסט - בעזרת מחלקות Bootstrap
                inputEl.classList.add("is-invalid");
                inputEl.classList.remove("is-valid");
                problemCount++;
                return;
            }

            const wrongResult = check.isWrong(value);

            if (wrongResult === false) {
                feedbackEl.textContent = "";
                inputEl.classList.add("is-valid");
                inputEl.classList.remove("is-invalid");
                return;
            }

            problemCount++;
            inputEl.classList.add("is-invalid");
            inputEl.classList.remove("is-valid");

            if (wrongResult === "notNumber") {
                feedbackEl.textContent = check.notNumberMsg;
            } else if (wrongResult === "notPositiveInt") {
                feedbackEl.textContent = check.notPositiveIntMsg;
            } else {
                feedbackEl.textContent = check.wrongMsg;
            }
        });

        /*
         * סף למשוב הכללי (עדיין פתוח להחלטה סופית, כפי שסומן במסמך התוכן):
         * 0 בעיות = נכונה, 1-2 בעיות = חלקית, 3 ומעלה = שגויה.
         * חיווי ויזואלי (מסגרת+רקע ירוק/כתום/אדום) נוסף לטקסט בעזרת מחלקות state-*.
         */
        const formFeedbackEl = document.getElementById("formFeedback");
        formFeedbackEl.classList.remove("state-success", "state-warning", "state-error");

        if (problemCount === 0) {
            formFeedbackEl.textContent = "כל הכבוד! הבקשה מלאה ומוכנה לאישור מנהל הסניף. מנהל הסניף " +
                "יכול לאשר אותה בלי לחזור אליכם להשלמות, ואחרי האישור רכז הרכש יכול להתחיל לטפל בה.";
            formFeedbackEl.classList.add("state-success");
        } else if (problemCount <= 2) {
            formFeedbackEl.textContent = "כמעט. הבקשה עדיין לא מוכנה לאישור. בקשה כזו הייתה חוזרת " +
                "אליכם להשלמה, וספירת 3 ימי העבודה הייתה מתחילה מחדש. תקנו את השדות המסומנים ושלחו שוב.";
            formFeedbackEl.classList.add("state-warning");
        } else {
            formFeedbackEl.textContent = "הבקשה עדיין רחוקה מלהיות מלאה. חזרו לתרחיש ומלאו כל שדה לפי " +
                "הפרטים שמופיעים בו. אפשר להיעזר בהסברים על חלקי הטופס.";
            formFeedbackEl.classList.add("state-error");
        }
    });

});
