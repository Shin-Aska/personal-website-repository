cd tmb
for i in *.png; do convert -thumbnail 390 $i ${i/.png/_}tmb.png; done;