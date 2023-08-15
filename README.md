# Using on kubernetes

- Configure the DATABASE_URL env of the mongodb server and the storage volume on deployment.yaml file.

- Make deployment.

```
kubectl apply -f deployment.yaml
```

- Add service to expose it.

```
kubectl apply -f service.yaml
```

# Using on a development enviroment

- Install the node.js dependencies.

```
npm install
```

- Run it with modemon executing the script run with a mongodb on the DATABASE_URL env var or keep the default localhost if empty.

```
DATABASE_URL=mongodb://localhost/file-sharing ./run
```
