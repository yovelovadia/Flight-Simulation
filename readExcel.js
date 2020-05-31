const input = document.querySelector('input[type="file"]'); // when importing files execute all program
input.addEventListener(
  "change",
  function (e) {
    const reader = new FileReader();
    reader.onload = function () {
      //////////////////////////////////////////
      const mymap = L.map("mapid").setView([31.771959, 35.217018], 8); // loading the map
      mymap.setMaxBounds(mymap.getBounds());

      const antena_icon = L.icon({
        // importing the antena icon
        iconUrl: "antena.png",
        iconSize: [30, 30],
        iconAnchor: [16, 25],
      });

      const plane_icon = L.icon({
        // importing the plane icon
        iconUrl: "plane.png",
        iconSize: [60, 60],
        iconAnchor: [30, 28],
      });

      const lines = reader.result.split("\n").map(function (line) {
        return line.split(",");
      });

      var saved_errors = {};
      for (var i = 0; i < lines.length; i++) {
        if (parseInt(lines[i][8]) !== 0) {
          saved_errors[i] = [i, lines[i][8], time_convertor(lines[i][2])];
        }
      }
      delete saved_errors["0"];

      // converting gps time to utc (human readable)
      function time_convertor(time) {
        const time_got = time / 86400;
        const time_by_hour = ((time_got % 1) * 86400) / 3600;
        const time_by_min = ((time_by_hour % 1) * 3600) / 60;
        const time_by_sec = (time_by_min % 1) * 60;
        return (
          ((Math.floor(time_by_hour) + "").length === 1
            ? "0" + Math.floor(time_by_hour)
            : Math.floor(time_by_hour)) +
          ":" +
          ((Math.floor(time_by_min) + "").length === 1
            ? "0" + Math.floor(time_by_min)
            : Math.floor(time_by_min)) +
          ":" +
          ((Math.floor(time_by_sec) + "").length === 1
            ? "0" + Math.floor(time_by_sec)
            : Math.floor(time_by_sec))
        );
      }

      /////////////////////// building all the stuff needed
      const data = document.createElement("h1"); //creating the data showing
      const errorBox = document.createElement("div");
      const error_peragraph = document.createElement("h4");
      errorBox.setAttribute("id", "errorBox");

      var play_button = document.createElement("button"); //stop/run button
      play_button.setAttribute("id", "play_button");
      play_button.onclick = run;

      var slider = document.createElement("INPUT"); // setting up slider
      slider.setAttribute("type", "range");
      slider.setAttribute("min", "1");
      slider.setAttribute("max", lines.length);
      slider.setAttribute("id", "slider");
      slider.onchange = stop_run;
      slider.value = 1;
      var running = false;

      document.body.appendChild(slider); //appending all
      document.body.appendChild(play_button);
      document.body.appendChild(errorBox);
      document.getElementById("show_data").appendChild(data);
      document.getElementById("errorBox").appendChild(error_peragraph);

      function run() {
        // run function happens when animation is played

        play_button.classList.toggle("paused");
        running = !running;

        var intervalID = setInterval(() => {
          //////////////////////////////// all the animations are happening here in this interval
          if (running === false) {
            clearInterval(intervalID);
          }

          slider.value = parseInt(slider.value) + 1;

          if (running === false) {
            // this is a correction for the animation because if not that it will run 1 more after pausing
            slider.value = slider.value - 1;
          }
          var position = parseInt(slider.value);

          data.innerHTML =
            "cc Time: " +
            lines[position][0] +
            "<br>Time: " +
            time_convertor(lines[position][2]) +
            "<br>Lat: " +
            lines[position][3] +
            "<br>Lon: " +
            lines[position][4] +
            "<br>Request1: " +
            lines[position][5] +
            "<br>Request2: " +
            lines[position][6];

          var error_p_checker = "Errors<br>";

          for (var i = 0; i < Object.values(saved_errors).length; i++) {
            //shows error at the right time
            if (Object.values(saved_errors)[i][0] <= position) {
              error_p_checker = [
                error_p_checker +
                  "error: " +
                  Object.values(saved_errors)[i][1] +
                  "  ,time: " +
                  Object.values(saved_errors)[i][2] +
                  "<br>",
              ];
            }
            error_peragraph.innerHTML = error_p_checker;
          }

          plane_marker.setLatLng([lines[position][3], lines[position][4]]);
          gdt_marker.setLatLng(a_list[lines[position][5]]);
          gdt_marker2.setLatLng(a_list[lines[position][6]]);
          connection.setLatLngs([
            a_list[lines[position][5]],
            [lines[position][3], lines[position][4]],
          ]);
          connection.setStyle(
            lines[position][5] == 0 ? { weight: 0 } : { weight: 5 }
          );
          connection2.setStyle(
            lines[position][6] == 0 ? { weight: 0 } : { weight: 5 }
          );
          connection2.setLatLngs([
            a_list[lines[position][6]],
            [lines[position][3], lines[position][4]],
          ]);
          connection.setStyle(
            lines[position][7] >= 0.4 ? { color: "green" } : { color: "red" }
          );
          connection2.setStyle(
            lines[position][7] >= 0.4 ? { color: "green" } : { color: "red" }
          );
          gdt_marker.bindPopup("site: " + lines[position][5]); //pop up for gdt1
          gdt_marker2.bindPopup("site: " + lines[position][6]); // same for gdt 2
        }, 1);
      }

      function stop_run() {
        /////////////////// when moving without pressing
        var position = slider.value;

        data.innerHTML =
          "cc Time: " +
          lines[position][0] +
          "<br>Time: " +
          time_convertor(lines[position][2]) +
          "<br>Lat: " +
          lines[position][3] +
          "<br>Lon: " +
          lines[position][4] +
          "<br>Request1: " +
          lines[position][5] +
          "<br>Request2: " +
          lines[position][6];

        var error_p_checker = "Errors <br>";

        for (var i = 0; i < Object.values(saved_errors).length; i++) {
          //shows error at the right time
          if (Object.values(saved_errors)[i][0] <= position) {
            error_p_checker = [
              error_p_checker +
                "error: " +
                Object.values(saved_errors)[i][1] +
                "  ,time: " +
                Object.values(saved_errors)[i][2] +
                "<br>",
            ];
          }
          error_peragraph.innerHTML = error_p_checker;
        }

        plane_marker.setLatLng([lines[position][3], lines[position][4]]);
        gdt_marker.setLatLng(a_list[lines[position][5]]);

        gdt_marker2.setLatLng(a_list[lines[position][6]]);

        connection.setLatLngs([
          a_list[lines[position][5]],
          [lines[position][3], lines[position][4]],
        ]);
        connection2.setLatLngs([
          a_list[lines[position][6]],
          [lines[position][3], lines[position][4]],
        ]);
        connection.setStyle(
          lines[position][5] == 0 ? { weight: 0 } : { weight: 5 }
        );
        connection2.setStyle(
          lines[position][6] == 0 ? { weight: 0 } : { weight: 5 }
        );

        connection.setStyle(
          lines[position][7] >= 0.4 ? { color: "green" } : { color: "red" }
        );
        connection2.setStyle(
          lines[position][7] >= 0.4 ? { color: "green" } : { color: "red" }
        );
        gdt_marker.bindPopup("site: " + lines[position][5]); //pop up for gdt1
        gdt_marker2.bindPopup("site: " + lines[position][6]); // same for gdt 2
      }

      const plane_marker = L.marker([lines[1][3], lines[1][4]], {
        // set up the marker with the plane icon
        icon: plane_icon,
      }).addTo(mymap);

      const gdt_marker = L.marker(a_list[lines[1][5]], {
        // set up the marker with the antena icon
        icon: antena_icon,
      }).addTo(mymap);

      const gdt_marker2 = L.marker(a_list[lines[1][6]], {
        // set up the second marker with the antena icon
        icon: antena_icon,
      }).addTo(mymap);

      const connection = L.polyline(
        //connection between plane and site
        [a_list[lines[1][5]], [lines[1][3], lines[1][4]]],

        {
          color: "green",
          weight: 0,
        }
      ).addTo(mymap);

      const connection2 = L.polyline(
        //connection between plane and site
        [a_list[lines[1][6]], [lines[1][3], lines[1][4]]],
        {
          color: "green",
          weight: 5,
        }
      ).addTo(mymap);

      gdt_marker.bindPopup("site: " + lines[1][5]); //pop up for gdt1
      gdt_marker2.bindPopup("site: " + lines[1][6]); // same for gdt 2

      L.tileLayer("atlas_map3/{z}/{x}/{y}.png", {
        //placing the imported map
        maxZoom: 8,
        minZoom: 7,
      }).addTo(mymap);

      ////////////////////////////////////////
    };
    reader.readAsText(input.files[0]);
  },
  false
);
