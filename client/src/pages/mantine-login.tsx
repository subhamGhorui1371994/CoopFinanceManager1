import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Paper, 
  TextInput, 
  PasswordInput, 
  Button, 
  Title, 
  Text, 
  Container,
  Center,
  Stack,
  Alert,
  Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconSchool, IconAlertCircle } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';

export default function MantineLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        notifications.show({
          title: 'Success',
          message: 'Logged in successfully',
          color: 'green',
        });
        setLocation('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={100}>
      <Center>
        <Stack align="center" gap="lg">
          {/* Logo */}
          <Paper radius="xl" p="lg" withBorder>
            <IconSchool size={48} color="#228be6" />
          </Paper>

          {/* Title */}
          <Stack align="center" gap="xs">
            <Title order={2}>Welcome to CoopLoan</Title>
            <Text c="dimmed" size="sm">
              Sign in to your cooperative management system
            </Text>
          </Stack>

          {/* Login Form */}
          <Paper withBorder shadow="md" p={30} mt={30} radius="md" w="100%">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                {error && (
                  <Alert
                    icon={<IconAlertCircle size="1rem" />}
                    title="Error"
                    color="red"
                    variant="light"
                  >
                    {error}
                  </Alert>
                )}

                <TextInput
                  label="Email Address"
                  placeholder="Enter your email"
                  required
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  required
                  {...form.getInputProps('password')}
                />

                <Button 
                  type="submit" 
                  fullWidth 
                  loading={loading}
                  size="md"
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            {/* Demo Credentials */}
            <Paper p="md" mt="lg" radius="sm" bg="gray.0">
              <Text size="sm" fw={500} mb="xs">Demo Credentials:</Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed" ff="monospace">
                  admin@cooploan.com / admin123
                </Text>
              </Group>
            </Paper>
          </Paper>
        </Stack>
      </Center>
    </Container>
  );
}