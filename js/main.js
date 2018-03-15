$(function () {
    var musiclist = MUSIC_LIST;
    var duration = null;
    var volume = 0;
    var isPlay = false;
    var idx = 0;
    
    musiclist.forEach(function (el, i) {
        var liDom = `<li class="component-musiclistitem row" data-id="${el.id}">
            <p><strong>${el.title}</strong> - ${el.artist}</p>
            <p class="-col-auto delete"></p>
        </li>`;
        $('#musiclist>ul').append(liDom);
    })

    $('#player').jPlayer({
        ready() {
            $(this).jPlayer('setMedia', {
                mp3: musiclist[idx].file
            }).jPlayer('play')
        },
        supplied: 'mp3',
        wmode: 'window'
    });

    var playmusic = function(idx){
        $('.music-title').text(musiclist[idx].title);
        $('.music-artist').text(musiclist[idx].artist);
        $('.music-pic').attr('src', musiclist[idx].cover);
        $('#player').jPlayer('setMedia', {
            mp3: musiclist[idx].file
        }).jPlayer('play');

        $('.component-musiclistitem').each((index,el) => {
            if(index === idx){
                $(el).addClass('focus');
            }else{
                $(el).removeClass('focus');
            }
        });
        if (!isPlay) {
            $('i.icon.play').toggleClass('pause play');
        }
        isPlay = true;
    }

    playmusic(idx);
    
    // 监测音乐播放
    $('#player').bind($.jPlayer.event.timeupdate, (e) => {
        duration = e.jPlayer.status.duration;
        volume = e.jPlayer.options.volume;
        var currentPercentAbsolute = Math.round(e.jPlayer.status.currentPercentAbsolute);
        $('.progress').css({ width: currentPercentAbsolute + '%' })
        $('.volume').css({ width: Math.round(volume * 100) + '%' })
        var leftTime = formatTime(duration * (1 - e.jPlayer.status.currentPercentAbsolute / 100))
        $('.left-time').text(`-${leftTime}`)
    });
    
    //循环随机单曲
    var repeatIdx = 0;
    $('i#repeat').click(function () {
        var repeatArr = ['repeat-cycle', 'repeat-once', 'repeat-random'];
        repeatIdx++;
        repeatIdx = repeatIdx % 3;
        repeatArr.forEach(element => {
            $('i#repeat').removeClass(element);
        });
        $(this).addClass(repeatArr[repeatIdx]);
    })

    //监测播放停止
    $('#player').bind($.jPlayer.event.ended, (e) => {
        var repeatstyle = getRepeatStyle();
        switch (repeatstyle) {
            case 'cycle':
                autoPlayNext('cycle')
                break
            case 'once':
                autoPlayNext('once')
                break
            case 'random':
                autoPlayNext('random')
                break
        }
    })

    function autoPlayNext(model) {
        let newIndex = null
        let musicListLength = musiclist.length
        switch (model) {
            case 'once':
                newIndex = idx
                break
            case 'random':
                do {
                    newIndex = Math.floor(Math.random() * musicListLength)
                } while (newIndex === idx)
                break
            default:
                newIndex = (idx + 1) % musicListLength
                break
        }
        playmusic(newIndex)
    }

    //上一曲下一曲
    $('i.icon.next').click(function (e) {
        var repeatstyle = getRepeatStyle();
        var musicListLength = musiclist.length;
        if (repeatstyle === 'random') {
            idx = Math.floor(Math.random() * musicListLength);
        } else {
            if (idx < musicListLength - 1) {
                idx++;
            } else {
                idx = 0;
            }
        }       
        progress = 0;
        playmusic(idx);
    })
    $('i.icon.prev').click(function (e) {
        if (idx > 0) {
            idx--;
        } else {
            idx = musiclist.length - 1;
        }
        progress = 0;
        playmusic(idx);
    })


    function getRepeatStyle() {
        var index, repeatstyle;
        index = $('i#repeat')[0].className.indexOf('cycle')
        if (index >= 0) {
            repeatstyle = 'cycle'
        } else {
            index = $('i#repeat')[0].className.indexOf('once')
            if (index >= 0) {
                repeatstyle = 'once'
            } else {
                repeatstyle = 'random'
            }
        }
        return repeatstyle;
    }

    // 进度控制
    $('#progressBar').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var progress = (e.clientX - $(this)[0].getBoundingClientRect().left) / $(this)[0].clientWidth;
        $('.progress').css({ width: Math.round(progress * 100) + '%' });
        $('#player').jPlayer('play', duration * progress);
    });

    // 音量控制
    $('#volumeBar').click(function(e){
        var volume = (e.clientX - $(this)[0].getBoundingClientRect().left) / $(this)[0].clientWidth;
        $('.volume').css({ width: Math.round(volume * 100) + '%' })               
        $('#player').jPlayer('volume',volume);
    })

    // 暂停||播放
    $('i.icon.pause').click(function(e){
        if(isPlay){
            $('#player').jPlayer('pause');
            $(this).toggleClass('pause play');                       
        }else{
            $('#player').jPlayer('play');
            $(this).toggleClass('pause play');
        }
        isPlay = !isPlay;
    })

    // 歌曲列表页点击播放
    // $.each($('.component-musiclistitem'), function (i, el) {
    //     // i, el 不更新 ？？？
    //     console.log(this)
    //     $(el).click(function (e) {
    //         idx = i;
    //         playmusic(idx)
    //     })
    // })

    $('.component-musiclistitem').click(function(e){
        var id = this.dataset.id;
        var j = -1;
        for (var i = 0; i < musiclist.length; i++){
            j++;
            if(id == musiclist[i].id){
                idx = j;
                playmusic(idx);
                break;
            }
        }
    })

    // 歌曲列表页点击删除
    $('.delete').each(function (i, el) {
        $(el).click(function (e) {
            e.stopPropagation();
            $(this).parent().remove();
            musiclist = musiclist.filter((el, index) => {
                return index !== i
            })
        })
    })

    var formatTime = function(time){
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        seconds = seconds < 10 ? `0${seconds}` : seconds
        return `${minutes}:${seconds}`
    }

})
