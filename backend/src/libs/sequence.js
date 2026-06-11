const qid = (name) => `"${String(name).replace(/"/g, '""')}"`;

export const resetSerialSequence = async (client, tableName, pkName) => {
  const sequenceResult = await client.query('select pg_get_serial_sequence($1, $2) as "sequenceName"', [
    qid(tableName),
    pkName,
  ]);
  const sequenceName = sequenceResult.rows[0]?.sequenceName;

  if (!sequenceName) return;

  await client.query(
    `select setval(
      $1,
      coalesce((select max(${qid(pkName)}) from ${qid(tableName)}), 0) + 1,
      false
    )`,
    [sequenceName]
  );
};
