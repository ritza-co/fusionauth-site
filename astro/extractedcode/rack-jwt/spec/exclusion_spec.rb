require 'spec_helper'

describe Rack::JWT::Auth do
  let(:issuer)  { Rack::JWT::Token }
  let(:secret)  { 'secret' } # use 'secret to match hardcoded 'secret' @ http://jwt.io'
  let(:verify)  { true }
  let(:payload) { { foo: 'bar' } }

  let(:inner_app) do
    ->(env) { [200, env, [payload.to_json]] }
  end

  let(:app) { Rack::JWT::Auth.new(inner_app, secret: secret, exclude: exclusion) }

  describe 'when handling exclusions' do
    context 'when exclusion is specified with String' do
      let(:exclusion) { %w(/books /music) }

      context 'with matching exact path' do
        it 'returns a 200' do
          get('/books')
          expect(last_response.status).to eq 200
        end
      end

      context 'with matching exact path with trailing slash' do
        it 'returns a 200' do
          get('/books/')
          expect(last_response.status).to eq 200
        end
      end

      context 'with matching exact path with sub-path' do
        it 'returns a 200' do
          get('/books/foo/bar')
          expect(last_response.status).to eq 200
        end
      end

      context 'with matching path and various http methods', :aggrgate_failures do
        it 'returns a 200' do
          get('/books/foo')
          expect(last_response.status).to eq 200

          post('/books/foo')
          expect(last_response.status).to eq 200

          patch('/books/foo')
          expect(last_response.status).to eq 200

          delete('/books/foo')
          expect(last_response.status).to eq 200
        end
      end
    end

    context 'when exclusion is specified with Hash' do
      let(:exclusion) do
        [
          { path: '/books',  methods: :all },
          { path: '/music',  methods: [:get] },
          { path: '/films',  methods: [:get] },
        ]
      end

      context 'with matching path and specific http method' do
        it 'returns a 200', :aggrgate_failures do
          get('/music')
          expect(last_response.status).to eq 200

          get('/music/')
          expect(last_response.status).to eq 200

          get('/music/foo/bar')
          expect(last_response.status).to eq 200
        end
      end

      context 'with matching path but a http method not specified' do
        it 'returns a 401', :aggrgate_failures do
          patch('/music/foo/bar')
          expect(last_response.status).to eq 401

          post('/music/foo/bar')
          expect(last_response.status).to eq 401

          delete('/music/foo/bar')
          expect(last_response.status).to eq 401
        end
      end

      context 'with matching path and all http methods' do
        it 'returns a 200', :aggrgate_failures do
          get('/books')
          expect(last_response.status).to eq 200

          post('/books/')
          expect(last_response.status).to eq 200

          patch('/books/foo')
          expect(last_response.status).to eq 200

          delete('/books/foo')
          expect(last_response.status).to eq 200
        end
      end

      context 'with no matching path and no token' do
        it 'returns a 401' do
          get('/somewhere')
          expect(last_response.status).to eq 401
        end
      end
    end
  end
end
