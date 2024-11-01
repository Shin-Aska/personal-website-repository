cd tmb
for i in *.png; do convert -thumbnail 390 $i ${i/.png/_}tmb.png; done;
for i in *.jpg; do convert -thumbnail 390 $i ${i/.jpg/_}tmb.jpg; done;
