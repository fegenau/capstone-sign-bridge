import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Platform, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import Canvas from "react-native-canvas";

const TensorCamera = cameraWithTensors(Camera);

const { height, width } = Dimensions.get("window");
export default function App() {
  
  //aca debe ir el leector del modelo YOLO .. 
  const [model, setModel] = useState<tf.GraphModel>();

  let context = useRef<CanvasRenderingContext2D | null>(null);
  let canvas = useRef<Canvas | null>(null);

  let textureDims =
    Platform.OS === "ios"
      ? { height: 1920, width: 1080 }
      : { height: 1200, width: 1600 };

  function handleCameraStream(images: any) {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (!model || !nextImageTensor) throw new Error("No hay modelo o imagen");
      model
        .executeAsync(nextImageTensor.expandDims(0))
        .then((predictions) => {
          drawRectangles(predictions, nextImageTensor);
        })
        .catch((error) => {
          console.log(error);
        });
      requestAnimationFrame(loop);
    };
    loop();
  }

  function drawRectangles(predictions: any, nextImageTensor: any) {
    if (!context.current || !canvas.current) return;

    const scaleWidth = width / nextImageTensor.shape[1];
    const scaleHeight = height / nextImageTensor.shape[0];

    const flipHorizontal = Platform.OS === "ios" ? false : true;

    context.current.clearRect(0, 0, width, height);

    for (const prediction of predictions) {
      const [x, y, width, height] = prediction.bbox;

      const boundingBoxX = flipHorizontal
        ? canvas.current.width - x * scaleWidth - width * scaleWidth
        : x * scaleWidth;

      const boundingBoxY = y * scaleHeight;
      // Dibujar el rectángulo
      context.current.strokeRect(
        boundingBoxX,
        boundingBoxY,
        width * scaleWidth,
        height * scaleHeight
      );

      // Dibujar la etiqueta
      context.current.strokeText(
        prediction.class,
        boundingBoxX - 5,
        boundingBoxY - 5
      );
    }

    async function handleCanvas(can: Canvas) {
      if (can) {
        can.width = width;
        can.height = height;
        const ctx: CanvasRenderingContext2D = can.getContext("2d");
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.fillStyle = "red";
        ctx.font = "20px Arial";

        context.current = ctx;
        canvas.current = can;
      }
    }

    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        await tf.ready();
        setModel(
          await tf.loadGraphModel(
            "../../sign-Bridge/assets/Modelo/runs/detect/train/weights/best_saved_model/best_float32.tflite"
          )
        );
      })();
    }, []);

    return (
      <View style={styles.container}>
        <TensorCamera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          cameraTextureHeight={textureDims.height}
          cameraTextureWidth={textureDims.width}
          resizeHeight={200}
          resizeWidth={152}
          resizeDepth={3}
          onReady={handleCameraStream}
          autorender={true}
          useCustomShadersToResize={false}
        />
        <Canvas style={styles.canvas} href={handleCanvas} />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    camera: {
      width: "100%",
      height: "100%",
    },
    canvas: {
      position: "absolute",
      zIndex: 10000000,
      width: "100%",
      height: "100%",
    },
  });
}
