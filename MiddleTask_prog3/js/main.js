document.addEventListener("DOMContentLoaded", function () {

    const toastTriggers = document.querySelectorAll(".toastTrigger");
    const toastLiveExample = document.getElementById("liveToast");

    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);

    toastTriggers.forEach(function (button) {
        button.addEventListener("click", function () {
            toastBootstrap.show();
        });
    });

});

/*
 * הצגת הודעת Toast בלחיצה על כפתורי בחירת התוכנית.
 * הקוד מבוסס על דוגמת "Live example" בתיעוד הרשמי של Bootstrap 5.3:
 *
 * בוצעה התאמה כך שכל שלושת הכפתורים יפעילו את אותה הודעת Toast,
 * באמצעות הוספת מאזין לאירוע לחיצה לכל אחד מהם.
 */