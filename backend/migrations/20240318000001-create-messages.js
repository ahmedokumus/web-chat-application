module.exports = {
  async up(db) {
    await db.createCollection('messages', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["sender_id", "receiver_id", "content"],
          properties: {
            sender_id: {
              bsonType: "objectId"
            },
            receiver_id: {
              bsonType: "objectId"
            },
            content: {
              bsonType: "string"
            },
            is_read: {
              bsonType: "bool"
            },
            read_at: {
              bsonType: ["date", "null"]
            },
            message_type: {
              enum: ["text", "image", "file"]
            },
            file_url: {
              bsonType: ["string", "null"]
            },
            createdAt: {
              bsonType: "date"
            },
            updatedAt: {
              bsonType: "date"
            }
          }
        }
      }
    });

    await db.collection('messages').createIndex({ createdAt: 1 });
    await db.collection('messages').createIndex({ sender_id: 1, receiver_id: 1 });
  },

  async down(db) {
    await db.collection('messages').drop();
  }
}; 