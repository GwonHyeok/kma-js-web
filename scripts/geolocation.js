/**
 * Created by GwonHyeok on 2016. 8. 2..
 */


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        // GPS 정보를 사용할 수 없다면 서울 정보로 보여준다
        showPosition(37.49543016888596, 127.03781811461468);
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    $('#latitude').text(latitude);
    $('#longitude').text(longitude);

    getWeather(latitude, longitude);
}

function getWeather(latitude, longitude) {
    var url = 'https://kh4975.iptime.org/weather' + '?latitude=' + latitude + '&longitude=' + longitude;
    $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
            var data = response.data;
            $('.weather-category').text(data.category);
            $('#weather-last-updated').text(new Date(data.lastUpdated).format('yyyy-MM-dd HH:mm'));

            var nowWeatherInfo = data.info[0];

            // 이미지
            $('.weather-image').attr('src', getWeatherImage(nowWeatherInfo.weather.value.en));
            $('.weather-date').text(new Date(nowWeatherInfo.time).format('yyyy.MM.dd E'));
            $('.weather-temp-low').text(nowWeatherInfo.temperature.min);
            $('.weather-temp-high').text(nowWeatherInfo.temperature.high);
            $('.weather-status').text(nowWeatherInfo.weather.value.ko);

            // 강수량
            $('#today-weather-rainfall').text(nowWeatherInfo.rain.expect['6'].rainfall || nowWeatherInfo.rain.expect['6'].snowfall);

            // 강수상태
            $('#today-weather-rain-status').text(nowWeatherInfo.rain.value);

            // 강수확률
            $('#today-weather-rain-probability').text(nowWeatherInfo.rain.probability);

            // 바람속도
            $('#today-weather-wind-speed').text(nowWeatherInfo.wind.speed);

            // 바람방향
            $('#today-weather-wind-direction').text(nowWeatherInfo.wind.direction.value.ko);

            // 습도
            $('#today-weather-humidity').text(nowWeatherInfo.humidity);


            // 미래의 날씨 데이터 현재로부터 3일까지의 데이터가 들어간다
            var futureDataSet = {};

            for (var i = 1; i < data.info.length; i++) {
                var weather = data.info[i];
                var date = new Date(weather.time);
                var weatherDateString = date.format('yyyy-MM-dd');

                if (!futureDataSet[weatherDateString]) {
                    futureDataSet[weatherDateString] = {
                        dayOfWeek: date.format('E'),
                        info: []
                    };
                }

                futureDataSet[weatherDateString].info.push(weather);
            }

            var index = 0;
            var futureId = ['first', 'second', 'third'];

            Object.keys(futureDataSet).forEach(function (futureDataKey) {
                var centerIndex = (futureDataSet[futureDataKey].info.length / 2) | 0;
                var midTimeWeatherData = futureDataSet[futureDataKey].info[centerIndex];
                var midDayOfWeek = futureDataSet[futureDataKey].dayOfWeek;
                var rootElementId = '#future-' + futureId[index] + '-day';

                var rootElement = $(rootElementId);


                // 요일
                $(rootElement).find('.future-day-of-week').text(midDayOfWeek);


                $(rootElement).find('.future-weather-image').attr('src', getWeatherImage(midTimeWeatherData.weather.value.en));

                $(rootElement).find('.future-weather-status').text(midTimeWeatherData.weather.value.ko);
                $(rootElement).find('.future-humidity').text(midTimeWeatherData.humidity);
                $(rootElement).find('.future-rain-status').text(midTimeWeatherData.rain.value);
                $(rootElement).find('.future-rain-probability').text(midTimeWeatherData.rain.probability);
                $(rootElement).find('.future-wind-speed').text(midTimeWeatherData.wind.speed);

                index++;
            });
        },
        error: function (response, status, error) {
            alert(response.responseJSON.error.detail);
        }
    })
}


//TODO 추후에 하늘 코드, 강수량 코드 등을 비교해서 이미지를 보여줌
function getWeatherImage(weatherValueEn) {
    switch (weatherValueEn) {
        case 'Clear':
            return 'images/weather/ic-02.png';

        case 'Partly Cloudy':
            return 'images/weather/ic-06.png';

        case 'Mostly Cloudy':
            return 'images/weather/ic-02.png';

        case 'Cloudy':
            return 'images/weather/ic-02.png';

        case 'Rain':
            return 'images/weather/ic-11.png';

        case 'Snow/Rain':
            return 'images/weather/ic-17.png';
    }

    return 'images/weather/ic-02.png';
}

Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy":
                return d.getFullYear();
            case "yy":
                return (d.getFullYear() % 1000).zf(2);
            case "MM":
                return (d.getMonth() + 1).zf(2);
            case "dd":
                return d.getDate().zf(2);
            case "E":
                return weekName[d.getDay()];
            case "HH":
                return d.getHours().zf(2);
            case "hh":
                return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm":
                return d.getMinutes().zf(2);
            case "ss":
                return d.getSeconds().zf(2);
            case "a/p":
                return d.getHours() < 12 ? "오전" : "오후";
            default:
                return $1;
        }
    });
};

String.prototype.string = function (len) {
    var s = '', i = 0;
    while (i++ < len) {
        s += this;
    }
    return s;
};
String.prototype.zf = function (len) {
    return "0".string(len - this.length) + this;
};
Number.prototype.zf = function (len) {
    return this.toString().zf(len);
};