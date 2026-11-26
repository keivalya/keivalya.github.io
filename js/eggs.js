// Small easter eggs. Nothing runs until a visitor triggers one.
(function () {
    var toastEl, toastTimer;

    function toast(msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'egg-toast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        // force a frame so the transition runs on first show
        requestAnimationFrame(function () { toastEl.classList.add('show'); });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
    }
    window.showSiteToast = toast;

    // 1. For the curious folks who open devtools.
    console.log(
        '%cHey, you opened the console. 👋',
        'font-size:14px;font-weight:600'
    );
    console.log('Since you are here: try the Konami code, type "vla", "wam", "rl" or "sudo", click my photo, or flip the theme a lot.');

    // 2. Konami code -> a little robot rolls across the screen.
    // 3. Typing "vla", "wam", "rl" or "sudo" anywhere -> a one-liner.
    var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var pos = 0, typed = '';
    var words = {
        vla: 'VLA: Vision → Language → Action. Pixels and words in, robot motions out.',
        wam: 'WAM: a World Action Model. It imagines what happens next before the robot commits.',
        rl: 'RL: reward goes up, robot falls over, repeat until it stops falling over.',
        sudo: 'Nice try. Robots here only take orders in natural language.'
    };

    document.addEventListener('keydown', function (e) {
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

        var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        pos = key === konami[pos] ? pos + 1 : (key === konami[0] ? 1 : 0);
        if (pos === konami.length) {
            pos = 0;
            var bot = document.createElement('div');
            bot.className = 'egg-robot';
            bot.textContent = '🤖';
            bot.setAttribute('aria-hidden', 'true');
            bot.addEventListener('animationend', function () { bot.remove(); });
            document.body.appendChild(bot);
            setTimeout(function () { bot.remove(); }, 4500);
            toast('Policy deployed. Success rate: 100% (in simulation).');
            return;
        }

        if (key.length === 1) {
            typed = (typed + key).slice(-8);
            for (var w in words) {
                // "rl" only counts as its own word, so typing "world" doesn't trigger it
                if (typed.slice(-w.length) === w && !/[a-z]/.test(typed.charAt(typed.length - w.length - 1) || ' ')) {
                    toast(words[w]); typed = ''; break;
                }
            }
        } else if (key !== 'Shift') {
            typed = '';
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        // 4. Click the photo.
        var img = document.querySelector('.hero-img');
        var lines = [
            'Human confirmed. Not a robot. Probably.',
            'Ouch. That was my face.',
            'Still human. Passed the CAPTCHA this morning.',
            'Running face-detection on you too, just so you know.',
            'Okay, you win. Go read pico-WAM instead.'
        ];
        var n = 0;
        if (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                img.classList.remove('egg-wiggle');
                void img.offsetWidth;
                img.classList.add('egg-wiggle');
                toast(lines[n++ % lines.length]);
            });
        }

        // 6. Flip the theme switch a lot.
        var themeBtn = document.getElementById('theme-toggle');
        var flips = [];
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                var now = Date.now();
                flips = flips.filter(function (t) { return now - t < 3000; });
                flips.push(now);
                if (flips.length >= 5) {
                    flips = [];
                    toast('Can\'t decide? Same with my learning rates.');
                }
            });
        }

        // 5. Double-click the little headline to reroll it.
        var note = document.getElementById('bio-text');
        if (note && typeof headlines !== 'undefined') {
            note.addEventListener('dblclick', function () {
                var next;
                do { next = headlines[Math.floor(Math.random() * headlines.length)]; }
                while (headlines.length > 1 && next === note.textContent);
                note.textContent = next;
            });
        }
    });

    // 7. Switch tabs and the title notices.
    var title = document.title;
    document.addEventListener('visibilitychange', function () {
        document.title = document.hidden ? '🤖 still training... come back' : title;
    });
})();
