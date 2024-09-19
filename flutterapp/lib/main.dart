import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: WebSocketDemo(),
    );
  }
}

class WebSocketDemo extends StatefulWidget {
  const WebSocketDemo({super.key});

  @override
  _WebSocketDemoState createState() => _WebSocketDemoState();
}

class _WebSocketDemoState extends State<WebSocketDemo> {
  final _channel = WebSocketChannel.connect(
    Uri.parse('ws://192.168.8.162:4000'),
  );

  final TextEditingController _controller = TextEditingController();
  List<String> _messages = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WebSocket Demo'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _controller,
              decoration: const InputDecoration(labelText: 'Send a message'),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                if (_controller.text.isNotEmpty) {
                  _channel.sink.add(_controller.text);
                  _controller.clear();
                  _channel.sink.close();
                }
              },
              child: const Text('Send Message'),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: StreamBuilder(
                stream: _channel.stream,
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    print(snapshot.data.toString());
                    //HERE WE ARE CONVERTING THE DATA TO STRING HERE THE DATA IS PASSING IN THE FORM OF BYTES
                    String message = String.fromCharCodes(snapshot.data);
                    _messages.add(message);
                  }
                  return ListView.builder(
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        title: Text(_messages[index]),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _channel.sink.close();
    _controller.dispose();
    super.dispose();
  }
}
