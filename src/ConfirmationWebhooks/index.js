exports.handler = async (event) => {
  // Log the event argument for debugging and for use in local development.
  console.log(
    "RECEIVING TRANSACTION IN TO WEBHOOK::::",
    JSON.stringify(event, undefined, 2)
  );

  console.log("TRANSACTION ID: ", JSON.parse(event.body));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Received the transaction success.`,
    }),
  };
};
