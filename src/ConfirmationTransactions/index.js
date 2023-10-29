const axios = require("axios");
exports.handler = async (event) => {
  // Log the event argument for debugging and for use in local development.
  console.log(
    "RECEIVING TRANSACTION FROM DYNAMO DB STREAMS: ",
    JSON.stringify(event, undefined, 2)
  );

  for (let i = 0; i < event.Records.length; i++) {
    const transaction = returnTransaction(event.Records[i]);
    const responseWebhook = await axios.post(
      `${process.env.WEBHOOK_URL}/confirmation`,
      transaction
    );
    console.log("RESPONSE WEBHOOK:::::", responseWebhook.data);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ error: "Transactions confirmed success." }),
  };
};

function returnTransaction(item) {
  return {
    id: item.dynamodb.NewImage.id.S,
    name: item.dynamodb.NewImage.name.S,
    phone_number: item.dynamodb.NewImage.phone_number.S,
    amount: item.dynamodb.NewImage.amount.S,
    creation_date: item.dynamodb.NewImage.creation_date.N,
  };
}
