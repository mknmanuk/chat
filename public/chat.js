$(function () {
    var socket = io.connect();

    let chat_content = $("#chat_content");
    let input_name = "";
    let input_message = $("#input_message");
    let input_send = $("#input_send");
    let his_id = $('input[name="input_id"]').val();

    input_send.on("click", function () {
        input_name = $("input[name='input_name']").val();
        // if (input_name === "") {
        //     input_name = "Guest-" + (Math.floor(Math.random() * 100) + 1);
        //     $("input[name='input_name']").val(input_name);
        // }
        let text = input_message.val();

        socket.emit("send_message", {
            text: text,
            name: input_name,
            his_id: his_id,
        });
        input_message.val("");

        fetch("/save_data", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversation_id:
                    sender_id < receiver_id
                        ? sender_id + "-" + receiver_id
                        : receiver_id + "-" + sender_id,
                sender_id: sender_id,
                receiver_id: receiver_id,
                text: text,
            }),
        });
    });

    socket.on("add_message", function (data) {
        let send_text = "send_text";
        let text_time = "text_time";
        let my_id = $('input[name="input_id"]').val();
        let his_id = data.his_id;
        console.log("his_id->" + his_id);
        console.log("my_id->" + my_id);
        console.log("sender_id->" + sender_id);
        console.log("receiver_id->" + receiver_id);

        if (my_id == receiver_id || my_id == sender_id) {
            if (data.name != input_name) {
                send_text = "send_text_reverse";
                text_time = "text_time_reverse";
            } else {
                data.name = "You";
            }
            let dt = new Date();
            let time =
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
        }
    });

    // send message by Enter key
    input_message.keypress(function (e) {
        let key = e.which;
        if (key == 13) {
            input_send.click();
            return false;
        }
    });
});
