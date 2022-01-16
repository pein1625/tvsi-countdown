// menu toggle
$(function () {
    $(".menu-toggle").on("click", function () {
        var $toggle = $(this);

        $toggle.toggleClass("active").siblings(".menu-sub").slideToggle();

        $toggle.siblings(".menu-mega").children(".menu-sub").slideToggle();

        $toggle.parent().siblings(".menu-item-group").children(".menu-sub").slideUp();

        $toggle.parent().siblings(".menu-item-group").children(".menu-mega").children(".menu-sub").slideUp();

        $toggle.parent().siblings(".menu-item-group").children(".menu-toggle").removeClass("active");
    });

    $(".menu-item-group > .menu-link, .menu-item-mega > .menu-link").on("click", function (e) {
        if ($(window).width() < 1200 || !mobileAndTabletCheck()) return;

        e.preventDefault();
    });
});

// navbar mobile toggle
$(function () {
    var $body = $("html, body");
    var $navbar = $(".js-navbar");
    var $navbarToggle = $(".js-navbar-toggle");

    $navbarToggle.on("click", function () {
        $navbarToggle.toggleClass("active");
        $navbar.toggleClass("is-show");
        $body.toggleClass("overflow-hidden");
    });
});

$(function () {
    var $moveTop = $(".btn-movetop");
    var $window = $(window);
    var $body = $("html");

    if (!$moveTop.length) return;

    $window.on("scroll", function () {
        if ($window.scrollTop() > 150) {
            $moveTop.addClass("show");

            return;
        }

        $moveTop.removeClass("show");
    });

    $moveTop.on("click", function () {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    });
});

/**

 * Merge images module customed by HaPK

 * First input image is uploaded img render by size 66.66% x 66.66%  position 22.13% x 24.46%

 * Second input image is square 100% 100% size

 */

(function (global, factory) {

    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.mergeImages = factory();
})(this, function () {

    "use strict";

    // Defaults

    var defaultOptions = {

        format: "image/jpeg",

        quality: 0.92,

        width: 1200,

        height: 1800,

        Canvas: undefined,

        crossOrigin: undefined

    };

    // Return Promise

    var mergeImages = function (sources, options) {

        if (sources === void 0) sources = [];

        if (options === void 0) options = {};

        return new Promise(function (resolve) {

            options = Object.assign({}, defaultOptions, options);

            // Setup browser/Node.js specific variables

            var canvas = options.Canvas ? new options.Canvas() : window.document.createElement("canvas");

            var Image = options.Image || window.Image;

            // Load sources

            var images = sources.map(function (source) {

                return new Promise(function (resolve, reject) {

                    // Convert sources to objects

                    if (source.constructor.name !== "Object") {

                        source = { src: source };
                    }

                    // Resolve source and img when loaded

                    var img = new Image();

                    img.crossOrigin = options.crossOrigin;

                    img.onerror = function () {

                        return reject(new Error("Couldn't load image"));
                    };

                    img.onload = function () {

                        return resolve(Object.assign({}, source, {

                            img: img,

                            width: img.width,

                            height: img.height

                        }));
                    };

                    img.src = source.src;
                });
            });

            // Get canvas context

            var ctx = canvas.getContext("2d");

            // When sources have loaded

            resolve(Promise.all(images).then(function (images) {

                // Set canvas dimensions

                var getSize = function (dim) {

                    return options[dim] || Math.max.apply(Math, images.map(function (image) {

                        return image.img[dim];
                    }));
                };

                canvas.width = getSize("width");

                canvas.height = getSize("height");

                // Draw images to canvas

                images.forEach(function (image, index) {

                    ctx.globalAlpha = image.opacity ? image.opacity : 1;

                    if (index === 0) {

                        let position = {

                            width: 0.833333,

                            height: 0.555484,

                            top: 0.222272,

                            left: 0.083333

                        };

                        if (image.width >= image.height) {

                            let height = canvas.height * position.height;

                            let top = canvas.height * position.top;

                            let width = height * image.width / image.height;

                            let left = canvas.width * (position.left + position.width / 2) - width / 2;

                            return ctx.drawImage(image.img, left, top, width, height);
                        }

                        let width = canvas.width * position.width;

                        let left = canvas.width * position.left;

                        let height = width * image.height / image.width;

                        let top = canvas.height * (position.top + position.height / 2) - height / 2;

                        return ctx.drawImage(image.img, left, top, width, height);
                    }

                    return ctx.drawImage(image.img, 0, 0, 1200, 1800); // edited code

                    // return ctx.drawImage(image.img, image.x || 0, image.y || 0); // An old line code
                });

                if (options.Canvas && options.format === "image/jpeg") {

                    // Resolve data URI for node-canvas jpeg async

                    return new Promise(function (resolve, reject) {

                        canvas.toDataURL(options.format, {

                            quality: options.quality,

                            progressive: false

                        }, function (err, jpeg) {

                            if (err) {

                                reject(err);

                                return;
                            }

                            resolve(jpeg);
                        });
                    });
                }

                // Resolve all other data URIs sync

                return canvas.toDataURL(options.format, options.quality);
            }));
        });
    };

    return mergeImages;
});

/**

 * Preview image input when uploaded

 */

$(function () {

    const $previewInput = $(".js-input-preview");

    const $hiddenInput = $(".js-image-value");

    const $section = $(".frame");

    const $downloadBtn = $(".js-download-image");

    const overlayImage = document.querySelector(".frame__overlay");

    if (!$previewInput.length) return;

    $previewInput.on("change", function () {

        let input = this;

        let parent = $(input).data("parent");

        let target = $(input).data("target");

        let multiple = $(input).prop("multiple");

        let $target;

        if (!target) return;

        if (parent) {

            $target = $(input).closest(parent).find(target);
        } else {

            $target = $(target);
        }

        if (!multiple) {

            $target.empty();
        }

        if (input.files) {

            let filesAmount = input.files.length;

            for (i = 0; i < filesAmount; i++) {

                let reader = new FileReader();

                reader.onload = function (event) {

                    // uploaded image

                    var uploadedImageData = event.target.result;

                    mergeImages([uploadedImageData, overlayImage.src]).then(mergedImg => {

                        // show uploaded image to dom

                        $($.parseHTML("<img>")).attr("src", uploadedImageData).appendTo($target);

                        // add to hidden input

                        $hiddenInput.val(mergedImg);

                        // show download + share btns

                        $section.addClass("active");
                    });
                };

                reader.readAsDataURL(input.files[i]);
            }
        }
    });

    $downloadBtn.on("click", function (e) {

        e.preventDefault();

        var imgData = $hiddenInput.val();

        if (imgData) {

            $(this).attr("disabled", true).css("opacity", 0.6);

            download(imgData);

            $(this).attr("disabled", false).css("opacity", 1);

            return;
        }

        console.log("No image data!");
    });
});

function download(image, type = "download", social_chanel = "") {

    var a = document.createElement('a');

    a.href = image;

    a.download = "image.jpg";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
}

// countdown timer

// .js-countdown(data-countdown="2021-1-24T12:45:04")

$(function () {

    $(".js-countdown").each(function () {

        let countdown = $(this).data("countdown");

        if (!countdown) return;

        let endTime = parseDate(countdown);

        let interval;

        const buildClock = () => {

            let thisTime = new Date().getTime();

            let duration = endTime - thisTime;

            if (duration < 0 && interval) {

                clearInterval(interval);

                return;
            }

            let seconds = Math.floor(duration / 1000 % 60);

            let minutes = Math.floor(duration / (1000 * 60) % 60);

            //   let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

            let hours = Math.floor(duration / (1000 * 60 * 60));

            let days = Math.floor(duration / (1000 * 60 * 60 * 24));

            let ampm = hours >= 12 ? "pm" : "am";

            // hours = hours * 12;


            seconds = ("0" + seconds).slice(-2);

            minutes = ("0" + minutes).slice(-2);

            hours = hours >= 10 ? hours : ("0" + hours).slice(-2);

            $(this).html(getCountDownTemplate({

                seconds,

                minutes,

                hours,

                days,

                ampm

            }));
        };

        buildClock();

        interval = setInterval(buildClock, 1000);
    });

    function parseDate(s) {

        var dateTime = s.split("T");

        var dateBits = dateTime[0].split("-");

        var timeBits = dateTime[1].split(":");

        return new Date(dateBits[0], parseInt(dateBits[1]) - 1, dateBits[2], timeBits[0], timeBits[1], timeBits[2]).valueOf();
    }

    function getCountDownTemplate(timer = {}) {

        return `

  <span>

    <span>${timer.hours}</span>:<span>${timer.minutes}</span>:<span>${timer.seconds}</span>

  </span>

      `;
    }
});