const AWS = require("aws-sdk");

// Initialize the DynamoDB Document Client
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TRANSACTIONS_TABLE_NAME;

exports.handler = async (event) => {
  const itemsToInsert = generateFakeTransactions(20);
  const putRequests = itemsToInsert.map((item) => ({
    PutRequest: {
      Item: item,
    },
  }));

  const params = {
    RequestItems: {
      [tableName]: putRequests,
    },
  };

  try {
    await dynamoDb.batchWrite(params).promise();
    console.log(
      `Successfully inserted ${itemsToInsert.length} fake transactions.`
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully inserted ${itemsToInsert.length} fake transactions.`,
      }),
    };
  } catch (error) {
    console.error("Error inserting fake transactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to insert fake transactions." }),
    };
  }
};

function generateFakeTransactions(count) {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const transaction = {
      id: generateUniqueId(),
      name: generateRandomName(),
      phone_number: generateRandomPhoneNumber(),
      amount: generateRandomAmount(),
      creation_date: new Date().getTime(),
      confirmation_send: false,
    };
    transactions.push(transaction);
  }

  return transactions;
}

function generateUniqueId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function generateRandomName() {
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Juan Manuel",
    "Alejandra",
    "Emiliano",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomPhoneNumber() {
  return `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

function generateRandomAmount() {
  return (Math.random() * 1000).toFixed(2);
}
