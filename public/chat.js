$(function () {
    var socket = io.connect();

    let chat_content = $("#chat_content");
    let input_name = "";
    let input_message = $("#input_message");
    let input_send = $("#input_send");

    input_send.on("click", function () {
        input_name = $("input[name='input_name']").val();
        if (input_name === "") {
            input_name = "Guest-" + (Math.floor(Math.random() * 100) + 1);
            $("input[name='input_name']").val(input_name);
        }
        let text = input_message.val();

        socket.emit("send_message", {
            text: text,
            name: input_name,
        });
        input_message.val("");
    });

    socket.on("add_message", function (data) {
        let send_text = "send_text";
        let text_time = "text_time";
        if (data.name != input_name) {
            send_text = "send_text_reverse";
            text_time = "text_time_reverse";
        } else {
            data.name = "You";
        }
        var dt = new Date();
        var time =
            dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        chat_content.append(
            "<div class='" +
                send_text +
                "'><b class='font-weight-bold'>" +
                data.name +
                ": </b>" +
                data.text +
                " </div><div class='clearfix'><div class='" +
                text_time +
                "'> " +
                time +
                "</div></div>"
        );
        chat_content.animate(
            { scrollTop: chat_content.prop("scrollHeight") },
            1000
        );
    });

    // send message by Enter key
    input_message.keypress(function (e) {
        var key = e.which;
        if (key == 13) {
            input_send.click();
            return false;
        }
    });
});
