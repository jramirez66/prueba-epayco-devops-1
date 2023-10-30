const axios = require("axios");
const AWS = require("aws-sdk");

// Initialize the DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TRANSACTIONS_TABLE_NAME;
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
    console.log("RESPONSE WEBHOOK::::", responseWebhook.data);

    //Update the transaction in dynamo DB
    const updateParams = {
      TableName: tableName,
      Key: {
        id: {
          S: transaction.id,
        },
        creation_date: {
          N: transaction.creation_date,
        },
      },
      UpdateExpression: "SET confirmation_send = :confirmationSend",
      ExpressionAttributeValues: {
        ":confirmationSend": true,
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("UPDATED PARAMS:::::", updateParams);

    try {
      const updatedData = await dynamoDb.update(updateParams).promise();
      console.log("Item updated successfully:", updatedData);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Item updated successfully",
          updatedItem: updatedData.Attributes,
        }),
      };
    } catch (error) {
      console.error("Error updating item:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to update item" }),
      };
    }
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
    creation_date: parseInt(item.dynamodb.NewImage.creation_date.N),
    confirmation_send: item.dynamodb.NewImage.confirmation_send.B,
  };
}
